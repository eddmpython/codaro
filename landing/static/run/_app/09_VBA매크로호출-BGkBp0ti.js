var e=`meta:
  id: xlwings_09
  title: 환율 변환 VBA와 RunPython
  order: 9
  category: xlwings
  badge: 심화
  difficulty: hard
  audience: 다중 워크북 통합까지 익혔고, VBA 자산이 있는 회사에서 Python과 VBA를 같이 쓰고 싶은 학습자
  packages:
    - xlwings
  tags:
    - xlwings
    - VBA
    - macro
    - RunPython
    - 환율
  seo:
    title: 환율 변환 VBA 매크로와 Python 호출 - xlwings book.macro
    description: 환율 변환 VBA 함수를 코드로 등록하고 Python에서 book.macro로 호출한 뒤 Excel 버튼에서 RunPython으로 Python을 호출하는 양방향 연동을 다룬다.
    keywords:
      - xlwings
      - VBA
      - 환율
      - RunPython
      - macro
intro:
  direction: VBA 모듈이 들어있는 xlsm 워크북에 환율 변환 함수를 코드로 등록하고 Python에서 book.macro로 호출한 뒤, 반대 방향(Excel 버튼 → Python)인 RunPython 패턴을 학습한다.
  benefits:
    - "book.macro(\\"이름\\")(인자)로 VBA 환율 변환 함수를 Python에서 직접 호출하고 결과를 받는다."
    - 회사의 기존 VBA 환율 자산을 버리지 않고 Python에서 재활용하는 통합 자동화 패턴을 익힌다.
    - RunPython 매크로 구조로 Excel 버튼에서 Python 함수를 호출하는 반대 방향을 이해한다.
    - 마지막 종합 레슨(10번)에서 사용할 UDF의 사전 지식을 확보한다.
  diagram:
    steps:
      - label: 1단계. xlsm 워크북에 VBA 모듈 추가
        detail: app.api.VBE를 통해 코드로 VBA 모듈을 추가하고 환율 변환 함수를 등록한다.
      - label: 2단계. Python에서 환율 변환 호출
        detail: book.macro("convertCurrency")(금액, 환율)로 등록된 VBA 함수를 호출하고 반환값을 받는다.
      - label: 3단계. RunPython 패턴 이해
        detail: VBA에서 Python을 호출하는 반대 방향 구조를 코드 모양으로 학습한다.
      - label: 4단계. 실습
        detail: 부가세 계산 VBA와 환율 변환 + RunPython 버튼 두 시나리오를 다룬다.
    runtime:
      - label: 환경 확인
        detail: xlwings가 import 가능해야 하고, Excel 본체가 VBA 매크로 실행을 허용해야 한다.
      - label: VBA 신뢰 설정
        detail: Excel 옵션 → 보안 센터 → 매크로 설정에서 "VBA 프로젝트 개체 모델 액세스 신뢰" 체크가 필요하다.
      - label: xlsm 확장자
        detail: VBA가 들어가는 워크북은 .xlsm 확장자로 저장해야 한다.
sections:
  - id: vba-trust-note
    title: 1단계. VBA 신뢰 설정과 xlsm 파일 만들기
    structuredPrimary: true
    subtitle: 사전 점검과 파일 준비
    goal: VBA 매크로 실행에 필요한 Excel 설정을 확인하고, xlsm 확장자로 저장하는 첫 워크북을 만든다.
    why: VBA 신뢰 설정이 꺼져 있으면 VBE 접근에서 에러가 난다. 본격적인 코드 전에 환경부터 확인해야 한다.
    explanation: |-
      Excel 옵션 → 보안 센터 → 매크로 설정에서 "VBA 프로젝트 개체 모델 액세스 신뢰" 옵션이 켜져 있어야 Python에서 VBA 모듈을 추가하거나 호출할 수 있습니다. 이 설정은 한 번만 켜면 됩니다.
      VBA 코드가 들어가는 워크북은 반드시 .xlsm 확장자로 저장해야 합니다. .xlsx로 저장하면 VBA 모듈이 사라집니다. xlwings에서는 book.save(path)의 경로 확장자로 자동 판별합니다.
      이번 단계에서는 환율 변환용 빈 xlsm 파일을 만들고, 그 안에 작성한 워크북이 매크로를 담을 수 있는 상태인지 확인합니다.
    tips:
      - "신뢰 설정이 꺼져 있으면 app.api.VBE 접근 시 \\"Programmatic access to Visual Basic Project is not trusted\\" 에러가 납니다."
      - 같은 워크북에 매크로와 데이터를 함께 두는 것이 자동화에서 가장 안전합니다.
    snippet: |-
      import xlwings as xw
      from pathlib import Path
      from tempfile import TemporaryDirectory

      fxTemp = TemporaryDirectory()
      fxPath = Path(fxTemp.name) / "fx_converter.xlsm"

      with xw.App(visible=False) as fxApp:
          fxBook = fxApp.books.add()
          fxSheet = fxBook.sheets.active
          fxSheet.name = "rates"
          fxSheet["A1"].value = "환율 변환 도구"
          fxBook.save(str(fxPath))
          savedExtension = fxPath.suffix
          fxBook.close()

      assert savedExtension == ".xlsm"
      assert fxPath.exists()
      {"path": str(fxPath.name), "ext": savedExtension}
    exercise:
      prompt: 파일 이름을 "exchange_rate_tool.xlsm"으로 바꾸고, 시트의 A1에 본인이 자주 다루는 환율 쌍(예 "USD/KRW") 라벨을 추가하세요.
      starterCode: |-
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        fxTemp = TemporaryDirectory()
        fxPath = Path(fxTemp.name) / "___.xlsm"

        with xw.App(visible=False) as fxApp:
            fxBook = fxApp.books.add()
            fxSheet = fxBook.sheets.active
            fxSheet.name = "rates"
            fxSheet["A1"].value = "___"
            fxBook.save(str(fxPath))
            savedTitle = fxSheet["A1"].value
            fxBook.close()

        assert savedTitle == "USD/KRW 환율"
        assert fxPath.name == "exchange_rate_tool.xlsm"
        {"path": str(fxPath.name), "title": savedTitle}
      solution: |-
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        fxTemp = TemporaryDirectory()
        fxPath = Path(fxTemp.name) / "exchange_rate_tool.xlsm"

        with xw.App(visible=False) as fxApp:
            fxBook = fxApp.books.add()
            fxSheet = fxBook.sheets.active
            fxSheet.name = "rates"
            fxSheet["A1"].value = "USD/KRW 환율"
            fxBook.save(str(fxPath))
            savedTitle = fxSheet["A1"].value
            fxBook.close()

        assert savedTitle == "USD/KRW 환율"
        assert fxPath.name == "exchange_rate_tool.xlsm"
        {"path": str(fxPath.name), "title": savedTitle}
      hints:
        - .xlsm 확장자는 VBA를 담을 수 있는 매크로 사용 워크북 형식입니다.
        - 파일 이름과 셀 값을 각각 다른 문자열로 채우면 됩니다.
    check:
      noError: xlsm 확장자 저장이 ValueError 없이 끝나고 파일이 디스크에 존재해야 합니다.
      resultCheck: 저장된 파일의 확장자가 .xlsm이고 셀 값이 의도한 문자열과 같아야 합니다.

  - id: add-vba-module
    title: 2단계. 환율 변환 VBA 함수 등록과 호출
    structuredPrimary: true
    subtitle: VBE.VBProjects + book.macro
    goal: app.api.VBE.VBProjects를 통해 환율 변환 VBA 모듈을 추가하고, book.macro로 호출해 USD → KRW 변환 결과를 받는다.
    why: 코드로 VBA를 추가할 수 있으면 매크로 배포가 자동화된다. 회사에 흩어진 VBA 자산을 Python 흐름에 묶을 수 있다.
    explanation: |-
      app.api.VBE.VBProjects(1).VBComponents.Add(1)로 새 모듈을 추가하고, .CodeModule.AddFromString(...)으로 VBA 코드를 채웁니다. 1은 모듈 종류(표준 모듈)입니다.
      등록된 VBA 함수는 book.macro("함수이름")(인자)로 Python에서 호출됩니다. VBA 함수가 반환값을 가지면 Python에서 그 값을 받을 수 있습니다.
      이번 단계에서는 금액(USD)과 환율을 받아 KRW로 변환하는 VBA 함수를 만들고 Python에서 호출해 결과를 검증합니다.
    tips:
      - VBA 함수 정의에서 Function ... End Function 사이의 줄바꿈은 \\r\\n이 안전합니다.
      - book.macro 호출은 워크북이 열려 있는 동안에만 가능합니다. close 후에는 호출이 무효가 됩니다.
    snippet: |-
      import xlwings as xw
      from pathlib import Path
      from tempfile import TemporaryDirectory

      fxTemp = TemporaryDirectory()
      fxPath = Path(fxTemp.name) / "fx_converter.xlsm"

      vbaCode = (
          "Function convertCurrency(amount As Double, rate As Double) As Double\\r\\n"
          "    convertCurrency = amount * rate\\r\\n"
          "End Function\\r\\n"
      )

      with xw.App(visible=False) as macroApp:
          macroBook = macroApp.books.add()
          macroBook.sheets.active.name = "rates"
          vbModule = macroApp.api.VBE.VBProjects(1).VBComponents.Add(1)
          vbModule.Name = "FxModule"
          vbModule.CodeModule.AddFromString(vbaCode)
          macroBook.save(str(fxPath))

          krwResult = macroBook.macro("convertCurrency")(100, 1320.5)
          macroBook.close()

      assert krwResult == 132050.0
      {"usd": 100, "rate": 1320.5, "krw": krwResult}
    exercise:
      prompt: 함수 이름을 "convertWithFee"로 바꾸고 수수료(%)를 추가 인자로 받아 (금액 * 환율) * (1 + 수수료/100)을 돌려주도록 만드세요.
      starterCode: |-
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        fxTemp = TemporaryDirectory()
        fxPath = Path(fxTemp.name) / "fx_converter.xlsm"

        vbaCode = (
            "Function ___(amount As Double, rate As Double, feePercent As Double) As Double\\r\\n"
            "    convertWithFee = amount * rate * (1 + feePercent / 100)\\r\\n"
            "End Function\\r\\n"
        )

        with xw.App(visible=False) as macroApp:
            macroBook = macroApp.books.add()
            macroBook.sheets.active.name = "rates"
            vbModule = macroApp.api.VBE.VBProjects(1).VBComponents.Add(1)
            vbModule.Name = "FxModule"
            vbModule.CodeModule.AddFromString(vbaCode)
            macroBook.save(str(fxPath))

            result = macroBook.macro("convertWithFee")(___, ___, ___)
            macroBook.close()

        assert result == 133370.5
        result
      solution: |-
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        fxTemp = TemporaryDirectory()
        fxPath = Path(fxTemp.name) / "fx_converter.xlsm"

        vbaCode = (
            "Function convertWithFee(amount As Double, rate As Double, feePercent As Double) As Double\\r\\n"
            "    convertWithFee = amount * rate * (1 + feePercent / 100)\\r\\n"
            "End Function\\r\\n"
        )

        with xw.App(visible=False) as macroApp:
            macroBook = macroApp.books.add()
            macroBook.sheets.active.name = "rates"
            vbModule = macroApp.api.VBE.VBProjects(1).VBComponents.Add(1)
            vbModule.Name = "FxModule"
            vbModule.CodeModule.AddFromString(vbaCode)
            macroBook.save(str(fxPath))

            result = macroBook.macro("convertWithFee")(100, 1320.5, 1.0)
            macroBook.close()

        assert result == 133370.5
        result
      hints:
        - VBA Function 이름은 호출 이름과 같아야 합니다. "convertWithFee"로 통일하세요.
        - 100 USD × 1320.5 × 1.01 = 133370.5.
    check:
      noError: VBE 접근과 모듈 추가, macro 호출이 PermissionError 없이 끝나야 합니다 (안 되면 VBA 신뢰 설정을 확인).
      resultCheck: VBA 함수의 반환값이 Python에서 받은 값과 정확히 일치해야 합니다.

  - id: runpython-pattern
    title: 3단계. RunPython 패턴 이해
    structuredPrimary: true
    subtitle: VBA → Python 반대 방향 호출
    goal: VBA 매크로 안에 RunPython 호출이 들어가는 코드 구조를 학습하고, 이 패턴이 환율 갱신 봇에 어떻게 적용되는지 정리한다.
    why: Excel 버튼에 RunPython을 연결하면 사용자는 평소처럼 Excel을 쓰면서 Python 자동화(환율 갱신, 보고서 빌드)의 결과를 받을 수 있다.
    explanation: |-
      RunPython은 xlwings가 제공하는 VBA 함수입니다. RunPython "import myModule; myModule.myFunction()" 형태로 VBA가 Python 코드를 실행합니다.
      이 패턴은 Excel에 버튼을 추가하고 그 버튼에 RunPython이 들어있는 매크로를 연결할 때 자주 씁니다. 사용자가 "환율 갱신" 버튼을 누르면 Python이 API에서 최신 환율을 받아 시트에 채우는 식입니다.
      이번 단계에서는 RunPython이 들어간 VBA 매크로 모양을 코드 문자열로 만들고 모듈에 등록합니다. 실제 동작 확인은 Excel에서 버튼을 누르는 순간에 일어나므로, 자동화 코드에서는 등록까지만 합니다.
    tips:
      - RunPython 호출이 동작하려면 xlwings add-in이 사용자 PC에 설치되어 있어야 합니다.
      - Python 측 함수는 import 가능한 모듈에 있어야 합니다. 보통 xlwings.bas 설정과 함께 모듈 경로를 잡습니다.
    snippet: |-
      import xlwings as xw
      from pathlib import Path
      from tempfile import TemporaryDirectory

      rpTemp = TemporaryDirectory()
      rpPath = Path(rpTemp.name) / "fx_button.xlsm"

      runPythonMacro = (
          "Sub RefreshRates()\\r\\n"
          "    RunPython \\"import fx_module; fx_module.refresh_rates()\\"\\r\\n"
          "End Sub\\r\\n"
      )

      with xw.App(visible=False) as rpApp:
          rpBook = rpApp.books.add()
          rpBook.sheets.active.name = "ui"
          rpBook.sheets["ui"]["A1"].value = "환율 갱신 버튼"
          vbModule = rpApp.api.VBE.VBProjects(1).VBComponents.Add(1)
          vbModule.Name = "ButtonModule"
          vbModule.CodeModule.AddFromString(runPythonMacro)
          rpBook.save(str(rpPath))

          moduleLines = vbModule.CodeModule.CountOfLines
          rpBook.close()

      assert moduleLines >= 3
      {"path": rpPath.name, "moduleLines": moduleLines}
    exercise:
      prompt: RunPython 매크로 이름을 "ExportToPdf"로 바꾸고, 호출할 Python 함수도 "report_module.export_pdf()"로 바꾸세요.
      starterCode: |-
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        rpTemp = TemporaryDirectory()
        rpPath = Path(rpTemp.name) / "fx_button.xlsm"

        runPythonMacro = (
            "Sub ___()\\r\\n"
            "    RunPython \\"import report_module; ___\\"\\r\\n"
            "End Sub\\r\\n"
        )

        with xw.App(visible=False) as rpApp:
            rpBook = rpApp.books.add()
            rpBook.sheets.active.name = "ui"
            vbModule = rpApp.api.VBE.VBProjects(1).VBComponents.Add(1)
            vbModule.Name = "ButtonModule"
            vbModule.CodeModule.AddFromString(runPythonMacro)
            rpBook.save(str(rpPath))

            firstLine = vbModule.CodeModule.Lines(1, 1)
            rpBook.close()

        assert "ExportToPdf" in firstLine
        firstLine
      solution: |-
        import xlwings as xw
        from pathlib import Path
        from tempfile import TemporaryDirectory

        rpTemp = TemporaryDirectory()
        rpPath = Path(rpTemp.name) / "fx_button.xlsm"

        runPythonMacro = (
            "Sub ExportToPdf()\\r\\n"
            "    RunPython \\"import report_module; report_module.export_pdf()\\"\\r\\n"
            "End Sub\\r\\n"
        )

        with xw.App(visible=False) as rpApp:
            rpBook = rpApp.books.add()
            rpBook.sheets.active.name = "ui"
            vbModule = rpApp.api.VBE.VBProjects(1).VBComponents.Add(1)
            vbModule.Name = "ButtonModule"
            vbModule.CodeModule.AddFromString(runPythonMacro)
            rpBook.save(str(rpPath))

            firstLine = vbModule.CodeModule.Lines(1, 1)
            rpBook.close()

        assert "ExportToPdf" in firstLine
        firstLine
      hints:
        - Sub 이름과 RunPython 안의 Python 호출 두 곳을 같이 바꿔야 합니다.
        - 실제 동작은 Excel 버튼 클릭 시점에 일어납니다. 등록까지만 검증합니다.
    check:
      noError: VBE 모듈 추가와 코드 등록이 PermissionError 없이 끝나야 합니다.
      resultCheck: 추가된 매크로의 첫 줄에 의도한 매크로 이름이 들어 있어야 합니다.

  - id: practice
    title: 4단계. 실습
    subtitle: VBA + Python 양방향 자동화
    blocks:
      - type: text
        content: |-
          이번 두 미션은 VBA 매크로를 Python으로 호출하는 양방향 자동화를 다룹니다.
      - type: tip
        content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되어 있으므로 import문은 생략해도 됩니다.
      - type: expansion
        title: "미션1: 부가세 계산 VBA 함수와 Python 호출"
        blocks:
          - type: code
            title: 부가세 함수 등록과 호출
            content: |-
              import xlwings as xw
              from pathlib import Path
              from tempfile import TemporaryDirectory

              taxTemp = TemporaryDirectory()
              taxPath = Path(taxTemp.name) / "tax_calculator.xlsm"

              taxCode = (
                  "Function calcVat(amount As Double) As Double\\r\\n"
                  "    calcVat = amount * 0.1\\r\\n"
                  "End Function\\r\\n"
              )

              with xw.App(visible=False) as taxApp:
                  taxBook = taxApp.books.add()
                  taxBook.sheets.active.name = "calc"
                  taxModule = taxApp.api.VBE.VBProjects(1).VBComponents.Add(1)
                  taxModule.Name = "TaxModule"
                  taxModule.CodeModule.AddFromString(taxCode)
                  taxBook.save(str(taxPath))

                  vatList = [taxBook.macro("calcVat")(amount) for amount in [10000, 25000, 78000]]
                  taxBook.close()

              assert vatList == [1000, 2500, 7800]
              vatList
      - type: expansion
        title: "미션2: 환율 표 갱신 매크로 + RunPython 버튼 등록"
        blocks:
          - type: code
            title: VBA 헬퍼와 RunPython 버튼 함께 등록
            content: |-
              import xlwings as xw
              from pathlib import Path
              from tempfile import TemporaryDirectory

              fxTemp = TemporaryDirectory()
              fxPath = Path(fxTemp.name) / "fx_dashboard.xlsm"

              dashboardCode = (
                  "Function rateCount() As Long\\r\\n"
                  "    rateCount = Sheets(\\"rates\\").UsedRange.Rows.Count\\r\\n"
                  "End Function\\r\\n"
                  "Sub RefreshFx()\\r\\n"
                  "    RunPython \\"import fx_module; fx_module.refresh_all_rates()\\"\\r\\n"
                  "End Sub\\r\\n"
              )

              with xw.App(visible=False) as fxApp:
                  fxBook = fxApp.books.add()
                  fxBook.sheets.active.name = "rates"
                  fxBook.sheets["rates"]["A1:C4"].value = [
                      ["pair", "rate", "updatedAt"],
                      ["USD/KRW", 1320.5, "2026-05-28"],
                      ["EUR/KRW", 1428.0, "2026-05-28"],
                      ["JPY/KRW", 8.92, "2026-05-28"],
                  ]
                  fxModule = fxApp.api.VBE.VBProjects(1).VBComponents.Add(1)
                  fxModule.Name = "FxModule"
                  fxModule.CodeModule.AddFromString(dashboardCode)
                  fxBook.save(str(fxPath))

                  vbaRowCount = int(fxBook.macro("rateCount")())
                  registeredLines = fxModule.CodeModule.CountOfLines
                  fxBook.close()

              assert vbaRowCount == 4
              assert registeredLines >= 6
              {"vbaRowCount": vbaRowCount, "lines": registeredLines}

  - id: summary
    title: 정리
    subtitle: VBA와 Python의 다리
    blocks:
      - type: text
        content: |-
          이번 레슨에서 환율 변환 VBA 모듈을 Python으로 등록하고, book.macro로 환율 변환과 부가세 계산을 호출하고, RunPython 패턴으로 반대 방향(VBA → Python)을 이해했습니다.
          다음 마지막 레슨에서는 @xw.func 데코레이터로 Python 함수를 Excel 수식으로 만드는 UDF를 다루고, 지금까지 배운 모든 패턴을 한 워크북으로 묶는 종합 프로젝트로 마무리합니다.
    goal: VBA와 Python을 양방향으로 잇는 패턴을 한 번 완성한 채로 마지막 레슨에 진입한다.
    why: 회사의 기존 VBA 자산을 Python으로 흡수하려면 두 도구를 함께 다루는 감각이 필요하다.
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
  - id: xlwings_09-macro-call-authorization-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - vba-trust-note
    - summary
    title: VBA 매크로 호출의 서명·allowlist·인자 계약 감사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 알 수 없는 workbook·macro·가변 인자를 차단한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - macro name뿐 아니라 workbook content hash와 signature를 검사하세요.
    - 인자 수와 schema를 호출 전에 제한하세요.
    exercise:
      prompt: authorize_macro_call(request, policy)를 완성하세요.
      starterCode: |-
        def authorize_macro_call(request, policy):
            raise NotImplementedError
      solution: |
        def authorize_macro_call(request, policy):
            failures = []
            if request.get("workbookHash") not in policy.get("allowedWorkbookHashes", []):
                failures.append("workbook")
            if request.get("macro") not in policy.get("allowedMacros", []):
                failures.append("macro")
            if len(request.get("args", [])) > policy.get("maxArgs", 0):
                failures.append("arguments")
            if policy.get("requireSignature") and not request.get("signatureValid"):
                failures.append("signature")
            return {"authorized": not failures, "failures": failures, "macro": request.get("macro"), "argumentCount": len(request.get("args", []))}
      hints: *id001
    check:
      id: python.xlwings.xlwings_09.macro-call-authorization.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_09.macro-call-authorization.mastery.behavior.v1.fixture
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
        entry: authorize_macro_call
        cases:
        - id: accepts-signed-allowlisted-call
          arguments:
          - value:
              workbookHash: h
              macro: BuildReport
              args:
              - 2026-01
              signatureValid: true
          - value:
              allowedWorkbookHashes:
              - h
              allowedMacros:
              - BuildReport
              maxArgs: 2
              requireSignature: true
          expectedReturn:
            authorized: true
            failures: []
            macro: BuildReport
            argumentCount: 1
        - id: reports-workbook-and-macro
          arguments:
          - value:
              workbookHash: x
              macro: DeleteAll
              args: []
          - value:
              allowedWorkbookHashes:
              - h
              allowedMacros:
              - BuildReport
              maxArgs: 1
              requireSignature: false
          expectedReturn:
            authorized: false
            failures:
            - workbook
            - macro
            macro: DeleteAll
            argumentCount: 0
        - id: reports-args-and-signature
          arguments:
          - value:
              workbookHash: h
              macro: BuildReport
              args:
              - 1
              - 2
              signatureValid: false
          - value:
              allowedWorkbookHashes:
              - h
              allowedMacros:
              - BuildReport
              maxArgs: 1
              requireSignature: true
          expectedReturn:
            authorized: false
            failures:
            - arguments
            - signature
            macro: BuildReport
            argumentCount: 2
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: xlwings_09-macro-effect-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - xlwings_09-macro-call-authorization-mastery
    title: 매크로 실행 전후의 허용된 변경 집합 대조하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 의도하지 않은 sheet·cell 변경을 찾는다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 매크로 실행 전후 workbook diff를 target 주소로 기록하세요.
    - 허용 패턴 밖의 변경이 하나라도 있으면 릴리스하지 마세요.
    exercise:
      prompt: audit_macro_effects(changes, allowed_patterns)를 완성하세요.
      starterCode: |-
        def audit_macro_effects(changes, allowed_patterns):
            raise NotImplementedError
      solution: |
        def audit_macro_effects(changes, allowed_patterns):
            import fnmatch
            authorized = []
            unauthorized = []
            for change in changes:
                target = change["target"]
                if any(fnmatch.fnmatchcase(target, pattern) for pattern in allowed_patterns):
                    authorized.append(target)
                else:
                    unauthorized.append(target)
            return {"passed": not unauthorized, "authorized": sorted(authorized), "unauthorized": sorted(unauthorized), "changeCount": len(changes)}
      hints: *id002
    check:
      id: python.xlwings.xlwings_09.macro-effect-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_09.macro-effect-reconciliation.transfer.behavior.v1.fixture
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
        entry: audit_macro_effects
        cases:
        - id: accepts-bounded-effects
          arguments:
          - value:
            - target: Summary!B2
            - target: Summary!C2
          - value:
            - Summary!*2
          expectedReturn:
            passed: true
            authorized:
            - Summary!B2
            - Summary!C2
            unauthorized: []
            changeCount: 2
        - id: reports-foreign-sheet
          arguments:
          - value:
            - target: Raw!A1
          - value:
            - Summary!*
          expectedReturn:
            passed: false
            authorized: []
            unauthorized:
            - Raw!A1
            changeCount: 1
        - id: separates-mixed-effects
          arguments:
          - value:
            - target: Summary!B2
            - target: Config!A1
          - value:
            - Summary!*
          expectedReturn:
            passed: false
            authorized:
            - Summary!B2
            unauthorized:
            - Config!A1
            changeCount: 2
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: xlwings_09-macro-safety-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - xlwings_09-macro-effect-reconciliation-transfer
    title: VBA 호출 안전 원칙 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 승인·실행·효과 대조를 복원한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - Web에서는 Excel 자동화 판단을 작은 함수로 즉시 검증하세요.
    - Local에서는 실제 Excel 프로세스와 workbook artifact 증거를 별도로 남기세요.
    exercise:
      prompt: choose_macro_evidence(stage)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_macro_evidence(stage):
            raise NotImplementedError
      solution: |
        def choose_macro_evidence(stage):
            table = {'authorize': {'action': 'verify workbook hash macro allowlist signature', 'evidence': 'call authorization', 'risk': 'untrusted code'}, 'execute': {'action': 'run with bounded args and timeout', 'evidence': 'redacted invocation log', 'risk': 'hung Excel'}, 'reconcile': {'action': 'diff workbook against allowed effects', 'evidence': 'target change report', 'risk': 'collateral edits'}}
            if stage not in table:
                raise ValueError('unknown stage')
            return table[stage]
      hints: *id003
    check:
      id: python.xlwings.xlwings_09.macro-safety-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.xlwings.xlwings_09.macro-safety-recall.retrieval.behavior.v1.fixture
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
        entry: choose_macro_evidence
        cases:
        - id: recalls-authorize
          arguments:
          - value: authorize
          expectedReturn:
            action: verify workbook hash macro allowlist signature
            evidence: call authorization
            risk: untrusted code
        - id: recalls-execute
          arguments:
          - value: execute
          expectedReturn:
            action: run with bounded args and timeout
            evidence: redacted invocation log
            risk: hung Excel
        - id: recalls-reconcile
          arguments:
          - value: reconcile
          expectedReturn:
            action: diff workbook against allowed effects
            evidence: target change report
            risk: collateral edits
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};