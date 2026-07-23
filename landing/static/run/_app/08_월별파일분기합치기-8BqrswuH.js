var e=`meta:
  id: xlwings_08
  title: 도시별 대기질 측정 파일 통합
  order: 8
  category: xlwings
  badge: 중급
  difficulty: medium
  audience: 표 자동화까지 익혔고, 실무에서 자주 만나는 "여러 파일을 한 파일로 합치는" 자동화를 만들고 싶은 학습자
  packages:
    - xlwings
    - pandas
  tags:
    - xlwings
    - 다중워크북
    - 통합
    - books.open
    - 환경데이터
  seo:
    title: 도시별 대기질 통합 - xlwings 다중 워크북 자동화
    description: 서울·부산·인천 대기질 측정 파일을 한 App에서 열어 데이터를 한 파일로 합치고, 도시별 평균 비교 보고서를 자동으로 만든다.
    keywords:
      - xlwings
      - 다중워크북
      - 대기질
      - books.open
      - PM10
intro:
  direction: 도시별로 흩어진 일일 대기질 측정 워크북 3개를 한 App에서 차례로 열어 데이터를 추출하고, 한 통합 워크북에 원본과 도시별 평균 시트를 함께 모으는 자동화를 만든다.
  benefits:
    - 같은 App 인스턴스 안에서 여러 워크북을 열고 닫는 안전한 패턴을 익힌다.
    - 각 파일에서 DataFrame으로 읽어 pandas로 결합한 뒤 다시 Excel로 내보내는 양방향 파이프라인을 완성한다.
    - 도시별 raw 데이터 + 통합 평균 시트를 한 워크북에 함께 두는 자동화 보고서 구조를 만든다.
    - 다음 레슨의 VBA 매크로 호출에서 사용할 "여러 파일을 다루는" 감각을 굳힌다.
  diagram:
    steps:
      - label: 1단계. 도시별 입력 파일 3개 자동 생성
        detail: 실습을 위해 서울·부산·인천의 PM10/PM25 측정 데이터를 별도 워크북으로 먼저 만든다.
      - label: 2단계. 한 App에서 차례로 열어 DataFrame으로 읽기
        detail: books.open으로 각 파일을 열고 expand + options(pd.DataFrame)로 데이터 추출 후 닫는다.
      - label: 3단계. pandas concat으로 결합 후 통합 워크북에 저장
        detail: 도시별 DataFrame 3개를 concat하고 도시별 평균 시트와 함께 새 워크북에 쓴다.
      - label: 4단계. 실습
        detail: 강수량 파일 통합과 매장별 일일 매출 파일 통합 두 시나리오를 다룬다.
    runtime:
      - label: 환경 확인
        detail: xlwings와 pandas가 모두 import 가능해야 한다.
      - label: 임시 폴더에 입력 파일 만들기
        detail: TemporaryDirectory에 seoul.xlsx, busan.xlsx, incheon.xlsx를 만들고, 같은 폴더에 city_air.xlsx로 통합 결과를 둔다.
      - label: 안전 정리
        detail: 모든 books.open은 books.close()로 명시적으로 닫고, App은 with 컨텍스트로 정리한다.
sections:
  - id: prepare-inputs
    title: 1단계. 도시별 측정 워크북 3개 만들기
    structuredPrimary: true
    subtitle: 실습 환경 자동 구성
    goal: 서울·부산·인천 세 도시의 일일 PM10/PM25 측정 데이터를 각각 별도 xlsx 파일로 만들어 통합 자동화의 입력으로 사용한다.
    why: 실무에서는 환경부 API나 도시별 측정소에서 매일 새 파일이 들어오지만, 학습 환경에서는 입력 파일도 코드로 만들어 재현 가능하게 한다.
    explanation: |-
      이번 단계는 실습을 위한 데이터 준비입니다. 실제 자동화에서는 이 파일들이 매일 환경부 측정소 시스템에서 들어오지만, 학습 시나리오에서는 같은 코드로 매번 같은 입력을 만들어 통합 단계를 검증할 수 있게 합니다.
      pandas DataFrame을 한 번에 시트에 쓰는 패턴을 4번 레슨에서 익혔으니 그대로 활용합니다.
      cityData = {도시: DataFrame} 형태의 dict로 데이터를 한 번에 잡고, dict를 순회하며 파일을 만듭니다.
    tips:
      - 같은 App 인스턴스에서 파일 3개를 차례로 만들면 매번 App을 띄우는 비용을 줄일 수 있습니다.
      - 파일 이름은 도시 영문 키로 통일하면 정렬과 순회가 안정됩니다.
    snippet: |-
      import pandas as pd
      import xlwings as xw
      from pathlib import Path
      from tempfile import TemporaryDirectory

      cityData = {
          "seoul": pd.DataFrame({
              "date": ["2026-05-26", "2026-05-27", "2026-05-28"],
              "pm10": [42, 58, 35],
              "pm25": [28, 35, 22],
          }),
          "busan": pd.DataFrame({
              "date": ["2026-05-26", "2026-05-27", "2026-05-28"],
              "pm10": [31, 38, 27],
              "pm25": [19, 24, 16],
          }),
          "incheon": pd.DataFrame({
              "date": ["2026-05-26", "2026-05-27", "2026-05-28"],
              "pm10": [48, 65, 41],
              "pm25": [31, 42, 26],
          }),
      }

      airTemp = TemporaryDirectory()
      airRoot = Path(airTemp.name)
      cityPaths = {city: airRoot / f"{city}.xlsx" for city in cityData}

      with xw.App(visible=False) as prepApp:
          for city, df in cityData.items():
              prepBook = prepApp.books.add()
              prepSheet = prepBook.sheets.active
              prepSheet.name = city
              prepSheet["A1"].options(index=False).value = df
              prepBook.save(str(cityPaths[city]))
              prepBook.close()

      allExist = all(p.exists() for p in cityPaths.values())
      assert allExist
      {"created": list(cityPaths.keys()), "allExist": allExist}
    exercise:
      prompt: 광주 데이터를 추가해 4개 파일을 만들고, 모든 파일이 디스크에 존재하는지 확인하세요.
      starterCode: |-
        import pandas as pd
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        cityData = {
            "seoul": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [42, 58], "pm25": [28, 35]}),
            "busan": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [31, 38], "pm25": [19, 24]}),
            "incheon": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [48, 65], "pm25": [31, 42]}),
            "___": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [___, ___], "pm25": [___, ___]}),
        }

        airTemp = TemporaryDirectory()
        airRoot = Path(airTemp.name)
        cityPaths = {city: airRoot / f"{city}.xlsx" for city in cityData}

        with xw.App(visible=False) as prepApp:
            for city, df in cityData.items():
                prepBook = prepApp.books.add()
                prepBook.sheets.active.name = city
                prepBook.sheets[city]["A1"].options(index=False).value = df
                prepBook.save(str(cityPaths[city]))
                prepBook.close()

        assert len(cityPaths) == 4
        assert all(p.exists() for p in cityPaths.values())
        list(cityPaths.keys())
      solution: |-
        import pandas as pd
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        cityData = {
            "seoul": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [42, 58], "pm25": [28, 35]}),
            "busan": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [31, 38], "pm25": [19, 24]}),
            "incheon": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [48, 65], "pm25": [31, 42]}),
            "gwangju": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [29, 36], "pm25": [17, 22]}),
        }

        airTemp = TemporaryDirectory()
        airRoot = Path(airTemp.name)
        cityPaths = {city: airRoot / f"{city}.xlsx" for city in cityData}

        with xw.App(visible=False) as prepApp:
            for city, df in cityData.items():
                prepBook = prepApp.books.add()
                prepBook.sheets.active.name = city
                prepBook.sheets[city]["A1"].options(index=False).value = df
                prepBook.save(str(cityPaths[city]))
                prepBook.close()

        assert len(cityPaths) == 4
        assert all(p.exists() for p in cityPaths.values())
        list(cityPaths.keys())
      hints:
        - dict의 키가 시트 이름과 파일 이름을 모두 정합니다.
        - 광주(gwangju)의 PM10/PM25 값을 본인이 정해서 양수 정수로 채우세요.
    check:
      noError: dict 순회와 books.add/close가 ValueError 없이 끝나야 합니다.
      resultCheck: 모든 도시별 파일이 생성되고 파일 시스템에 존재해야 합니다.

  - id: open-and-read-all
    title: 2단계. 한 App에서 차례로 열어 DataFrame 추출
    structuredPrimary: true
    subtitle: books.open + DataFrame 변환 + close
    goal: 같은 App 인스턴스에서 도시별 파일을 차례로 열어 expand + options로 DataFrame을 추출하고 닫는다.
    why: 매번 App을 띄우면 시간이 오래 걸린다. 한 App에서 파일을 차례로 열고 닫는 것이 통합 자동화의 표준 패턴이다.
    explanation: |-
      with xw.App() as app: 블록 안에서 app.books.open(path)를 반복 호출하면 같은 Excel 프로세스에서 여러 파일을 차례로 다룰 수 있습니다.
      각 파일을 연 뒤 expand + options(pd.DataFrame)로 데이터를 추출하고, dict에 "도시명": DataFrame으로 모읍니다. 처리 후에는 반드시 book.close()를 호출해 다음 파일을 열 준비를 합니다.
      이 단계의 결과는 도시별 DataFrame 3개가 모인 dict입니다. 다음 단계의 concat 입력이 됩니다.
    tips:
      - books.open으로 연 워크북을 close 없이 두면 같은 이름의 새 파일을 열 때 충돌이 날 수 있습니다.
      - 추출 후 데이터를 다른 변수에 옮겨두고 close하면 메모리 사용을 줄일 수 있습니다.
    snippet: |-
      import pandas as pd
      import xlwings as xw
      from pathlib import Path
      from tempfile import TemporaryDirectory

      cityData = {
          "seoul": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [42, 58], "pm25": [28, 35]}),
          "busan": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [31, 38], "pm25": [19, 24]}),
          "incheon": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "pm10": [48, 65], "pm25": [31, 42]}),
      }
      airTemp = TemporaryDirectory()
      airRoot = Path(airTemp.name)
      cityPaths = {city: airRoot / f"{city}.xlsx" for city in cityData}

      with xw.App(visible=False) as setupApp:
          for city, df in cityData.items():
              setupBook = setupApp.books.add()
              setupBook.sheets.active.name = city
              setupBook.sheets[city]["A1"].options(index=False).value = df
              setupBook.save(str(cityPaths[city]))
              setupBook.close()

      collected = {}
      with xw.App(visible=False) as readApp:
          for city, path in cityPaths.items():
              readBook = readApp.books.open(str(path))
              readSheet = readBook.sheets[city]
              cityDf = readSheet["A1"].expand("table").options(pd.DataFrame, header=1, index=False).value
              cityDf["pm10"] = cityDf["pm10"].astype(int)
              cityDf["pm25"] = cityDf["pm25"].astype(int)
              cityDf["city"] = city
              collected[city] = cityDf
              readBook.close()

      assert set(collected.keys()) == {"seoul", "busan", "incheon"}
      assert collected["seoul"].shape[0] == 2
      {city: df.shape for city, df in collected.items()}
    exercise:
      prompt: collected에 모인 DataFrame 3개의 총 행 수를 변수로 계산하고 6이 맞는지 확인하세요.
      starterCode: |-
        # 위 snippet의 코드가 그대로 실행되었다고 가정
        # 각 도시 2행 × 3도시 = 6행
        totalRows = sum(df.shape[0] for df in collected.values())

        assert totalRows == ___
        totalRows
      solution: |-
        totalRows = sum(df.shape[0] for df in collected.values())

        assert totalRows == 6
        totalRows
      hints:
        - 2 + 2 + 2 = 6입니다.
        - .shape[0]은 DataFrame의 행 수입니다.
    check:
      noError: books.open과 close가 모든 파일에 대해 FileNotFoundError 없이 끝나야 합니다.
      resultCheck: collected dict가 모든 도시의 DataFrame을 가지고 각 DataFrame이 입력 데이터와 같은 행 수를 가져야 합니다.

  - id: concat-and-save
    title: 3단계. concat으로 결합하고 통합 워크북에 저장
    structuredPrimary: true
    subtitle: pandas.concat + 도시별 평균 시트
    goal: 도시별 DataFrame들을 pandas.concat으로 한 DataFrame으로 합치고, 통합 워크북에 raw 시트와 city_avg 시트를 함께 만든다.
    why: 자동화의 최종 산출물은 사람이 한 파일로 보는 것이다. 도시별 raw 데이터와 도시별 평균을 한 워크북에 함께 두는 것이 가장 흔한 패턴이다.
    explanation: |-
      pd.concat([df1, df2, df3], ignore_index=True)는 세 DataFrame을 세로로 이어 붙입니다. 각 DataFrame에 city 컬럼을 미리 추가해 두면 어느 도시 데이터인지 추적할 수 있습니다.
      합쳐진 DataFrame을 groupby("city")["pm10"].mean()으로 묶으면 도시별 PM10 평균이 나옵니다. 같은 방식으로 PM25 평균도 계산해 정렬해서 새 시트에 입력하면 통합 보고서가 완성됩니다.
      통합 워크북에는 raw 시트(전체 데이터), city_avg 시트(도시별 평균) 두 시트를 함께 두는 것이 추적과 검증에 좋습니다.
    tips:
      - concat의 ignore_index=True는 인덱스를 0부터 다시 매깁니다. 분석에서는 보통 이쪽이 안전합니다.
      - groupby + mean 결과는 reset_index()로 일반 DataFrame으로 만들면 시트에 쓰기 쉽습니다.
    snippet: |-
      import pandas as pd
      import xlwings as xw
      from pathlib import Path
      from tempfile import TemporaryDirectory

      cityData = {
          "seoul": pd.DataFrame({"date": ["2026-05-26", "2026-05-27", "2026-05-28"], "pm10": [42, 58, 35], "pm25": [28, 35, 22]}),
          "busan": pd.DataFrame({"date": ["2026-05-26", "2026-05-27", "2026-05-28"], "pm10": [31, 38, 27], "pm25": [19, 24, 16]}),
          "incheon": pd.DataFrame({"date": ["2026-05-26", "2026-05-27", "2026-05-28"], "pm10": [48, 65, 41], "pm25": [31, 42, 26]}),
      }
      airTemp = TemporaryDirectory()
      airRoot = Path(airTemp.name)
      cityPaths = {city: airRoot / f"{city}.xlsx" for city in cityData}
      airPath = airRoot / "city_air.xlsx"

      with xw.App(visible=False) as setupApp:
          for city, df in cityData.items():
              setupBook = setupApp.books.add()
              setupBook.sheets.active.name = city
              setupBook.sheets[city]["A1"].options(index=False).value = df
              setupBook.save(str(cityPaths[city]))
              setupBook.close()

      collected = []
      with xw.App(visible=False) as readApp:
          for city, path in cityPaths.items():
              rBook = readApp.books.open(str(path))
              rDf = rBook.sheets[city]["A1"].expand("table").options(pd.DataFrame, header=1, index=False).value
              rDf["pm10"] = rDf["pm10"].astype(int)
              rDf["pm25"] = rDf["pm25"].astype(int)
              rDf["city"] = city
              collected.append(rDf)
              rBook.close()

      mergedDf = pd.concat(collected, ignore_index=True)
      cityAvg = mergedDf.groupby("city", as_index=False).agg(pm10Avg=("pm10", "mean"), pm25Avg=("pm25", "mean")).sort_values("pm10Avg", ascending=False)

      with xw.App(visible=False) as outApp:
          outBook = outApp.books.add()
          outBook.sheets.active.name = "raw"
          outBook.sheets["raw"]["A1"].options(index=False).value = mergedDf
          summarySheet = outBook.sheets.add("city_avg")
          summarySheet["A1"].options(index=False).value = cityAvg
          outBook.save(str(airPath))
          outBook.close()

      assert airPath.exists()
      assert mergedDf.shape[0] == 9
      assert cityAvg.iloc[0]["city"] == "incheon"
      {"path": str(airPath.name), "rawRows": mergedDf.shape[0], "worstCity": cityAvg.iloc[0]["city"]}
    exercise:
      prompt: cityAvg에서 PM25 평균이 가장 높은 도시를 추출하세요.
      starterCode: |-
        # 위 snippet 실행 후
        worstPm25 = cityAvg.sort_values("___", ascending=False).iloc[0]["city"]

        assert worstPm25 == "incheon"
        worstPm25
      solution: |-
        worstPm25 = cityAvg.sort_values("pm25Avg", ascending=False).iloc[0]["city"]

        assert worstPm25 == "incheon"
        worstPm25
      hints:
        - cityAvg에는 pm25Avg 컬럼이 있습니다.
        - 인천 PM25 평균: (31+42+26)/3 = 33으로 가장 높습니다.
    check:
      noError: concat과 groupby, 통합 워크북 저장이 ValueError 없이 끝나야 합니다.
      resultCheck: 통합 파일이 디스크에 존재하고, city_avg 시트에 도시별 평균이 정확히 계산되어 있어야 합니다.

  - id: practice
    title: 4단계. 실습
    subtitle: 다중 파일 통합 두 시나리오
    blocks:
      - type: text
        content: |-
          이번 두 미션은 다중 워크북 통합 패턴을 두 가지 시나리오에 적용합니다.
      - type: tip
        content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되어 있으므로 import문은 생략해도 됩니다.
      - type: expansion
        title: "미션1: 지역별 강수량 파일 통합"
        blocks:
          - type: code
            title: 강수량 파일 만들고 통합
            content: |-
              import pandas as pd
              import xlwings as xw
              from pathlib import Path
              from tempfile import TemporaryDirectory

              rainData = {
                  "seoul": pd.DataFrame({"date": ["2026-05-26", "2026-05-27", "2026-05-28"], "rainMm": [0.0, 12.4, 3.2]}),
                  "jeju": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "rainMm": [8.5, 24.1]}),
                  "daegu": pd.DataFrame({"date": ["2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"], "rainMm": [0.0, 0.0, 1.2, 5.8]}),
              }
              rainTemp = TemporaryDirectory()
              rainRoot = Path(rainTemp.name)
              rainPaths = {r: rainRoot / f"{r}.xlsx" for r in rainData}

              with xw.App(visible=False) as rApp:
                  for region, df in rainData.items():
                      rBook = rApp.books.add()
                      rBook.sheets.active.name = region
                      rBook.sheets[region]["A1"].options(index=False).value = df
                      rBook.save(str(rainPaths[region]))
                      rBook.close()

                  collectedRain = []
                  for region, path in rainPaths.items():
                      readBook = rApp.books.open(str(path))
                      df = readBook.sheets[region]["A1"].expand("table").options(pd.DataFrame, header=1, index=False).value
                      df["rainMm"] = df["rainMm"].astype(float)
                      df["region"] = region
                      collectedRain.append(df)
                      readBook.close()

              rainMerged = pd.concat(collectedRain, ignore_index=True)
              rainGrand = round(float(rainMerged["rainMm"].sum()), 1)

              assert rainGrand == 55.2
              {"grand": rainGrand, "rows": rainMerged.shape[0]}
      - type: expansion
        title: "미션2: 매장별 일일 매출 파일 통합 + 매장 랭킹 시트"
        blocks:
          - type: code
            title: 매장 파일 만들고 통합 시트까지 저장
            content: |-
              import pandas as pd
              import xlwings as xw
              from pathlib import Path
              from tempfile import TemporaryDirectory

              storeData = {
                  "gangnam": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "sales": [3800000, 4150000]}),
                  "hongdae": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "sales": [4900000, 5200000]}),
                  "sinchon": pd.DataFrame({"date": ["2026-05-26", "2026-05-27"], "sales": [3100000, 3450000]}),
              }
              sTemp = TemporaryDirectory()
              sRoot = Path(sTemp.name)
              storePaths = {s: sRoot / f"{s}.xlsx" for s in storeData}
              combinedPath = sRoot / "stores.xlsx"

              with xw.App(visible=False) as setupApp:
                  for store, df in storeData.items():
                      sBook = setupApp.books.add()
                      sBook.sheets.active.name = store
                      sBook.sheets[store]["A1"].options(index=False).value = df
                      sBook.save(str(storePaths[store]))
                      sBook.close()

              storeCollected = []
              with xw.App(visible=False) as combineApp:
                  for store, path in storePaths.items():
                      cBook = combineApp.books.open(str(path))
                      cDf = cBook.sheets[store]["A1"].expand("table").options(pd.DataFrame, header=1, index=False).value
                      cDf["sales"] = cDf["sales"].astype(int)
                      cDf["store"] = store
                      storeCollected.append(cDf)
                      cBook.close()

                  storeMerged = pd.concat(storeCollected, ignore_index=True)
                  storeRank = storeMerged.groupby("store", as_index=False)["sales"].sum().sort_values("sales", ascending=False)

                  outBook = combineApp.books.add()
                  outBook.sheets.active.name = "raw"
                  outBook.sheets["raw"]["A1"].options(index=False).value = storeMerged
                  outBook.sheets.add("rank")["A1"].options(index=False).value = storeRank
                  outBook.save(str(combinedPath))
                  outBook.close()

              assert combinedPath.exists()
              assert storeRank.iloc[0]["store"] == "hongdae"
              {"combinedPath": str(combinedPath.name), "topStore": storeRank.iloc[0]["store"]}

  - id: summary
    title: 정리
    subtitle: 다중 파일을 한 파일로 모으는 감각
    blocks:
      - type: text
        content: |-
          이번 레슨에서 한 App에서 여러 파일을 열고 닫으며 데이터를 추출하고, pandas concat으로 결합한 뒤 통합 워크북에 raw + 평균/랭킹 두 시트로 저장하는 표준 패턴을 완성했습니다.
          다음 레슨에서는 VBA 매크로가 들어있는 워크북을 다루고, Python에서 매크로를 호출하거나 RunPython 패턴으로 Excel 버튼에서 Python을 호출하는 양방향 연동을 배웁니다.
    goal: 다중 파일 통합 자동화를 한 번 완성한 채로 다음 레슨에 진입한다.
    why: 실무 자동화의 50% 이상이 "여러 파일을 한 파일로 합치는" 작업이다.
`;export{e as default};