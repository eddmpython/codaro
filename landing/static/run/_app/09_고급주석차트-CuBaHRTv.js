var e=`meta:
  packages:
  - matplotlib
  - numpy
  - pandas
  id: matplotlib_09
  title: 고급주석차트
  order: 9
  category: matplotlib
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - matplotlib
  - annotate
  - LaTeX
  - bbox
  - errorbar
  - annotation
  seo:
    title: Matplotlib 고급 주석 - annotate, LaTeX, errorbar로 전문 차트 만들기
    description: Matplotlib으로 전문적인 주석 차트를 만듭니다. annotate 화살표, LaTeX 수식, bbox 텍스트박스, errorbar 오차막대 사용법을
      배웁니다.
    keywords:
    - matplotlib
    - annotate
    - LaTeX
    - bbox
    - errorbar
    - 주석
    - 수식
intro:
  emoji: 📝
  goal: 주요 이벤트가 표시된 주가 차트를 만듭니다.
  description: annotate로 화살표와 주석을 추가하고, LaTeX로 수학 표현식을 넣으며, bbox로 텍스트 박스를 꾸밉니다. errorbar로 불확실성을 표현하는 방법도
    배웁니다. 이전에 배운 plot, figure, legend, spines 개념을 활용합니다.
  direction: 고급주석차트에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.
  benefits:
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.
  - 고급주석차트 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 11단계. 한글 폰트 설정 처리 실행
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 2단계. 주가 데이터 생성 결과 검증
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.
    - label: 고급주석차트 재사용
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 시각 리포트 환경
      detail: matplotlib, numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 고급주석차트 실행
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.
    - label: 고급주석차트 완료
      detail: 검증된 코드를 보고서 차트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    주가 데이터를 생성하고 주요 이벤트를 표시하는 고급 차트를 만듭니다. annotate로 화살표와 설명을 추가하고, LaTeX로 수식을 표현하며, bbox로 텍스트를 강조합니다.

    import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. numpy는 np로, pandas는 pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.
  tips:
  - import matplotlib.pyplot as plt는 matplotlib의 pyplot 모듈을 plt라는 짧은 이름으로 불러오는 관례입니다. numpy는 np로, pandas는
    pd로 줄여 쓰는 것이 데이터 과학 커뮤니티의 표준입니다.
  snippet: |-
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import matplotlib.pyplot as plt
      import numpy as np
      import pandas as pd
    hints:
    - 바꿀 지점은 시각화할 데이터을 만드는 첫 줄과 차트 구성 줄에서 찾으세요.
    - 실행 뒤 축/범례/파일 출력 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 축/범례/파일 출력 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step1_font
  title: 1-1단계. 한글 폰트 설정
  structuredPrimary: true
  subtitle: Codaro 로컬 Python 환경 폰트
  goal: 11단계. 한글 폰트 설정에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    Codaro 로컬 Python에서는 실행 환경에 따라 기본 폰트에 한글 글리프가 없을 수 있습니다. CDN 또는 로컬 폰트 파일을 matplotlib에 등록하는 방식으로 해결합니다. Pretendard는 무료 오픈소스 폰트로, 한글과 영문 모두 깔끔하게 표시됩니다.

    font_manager로 현재 환경의 폰트 목록을 확인하고, 사용 가능한 한글 폰트를 rcParams에 설정합니다. axes.unicode_minus = False는 마이너스 기호가 깨지는 것을 방지합니다.
  tips:
  - font_manager로 현재 환경의 폰트 목록을 확인하고, 사용 가능한 한글 폰트를 rcParams에 설정합니다. axes.unicode_minus = False는 마이너스
    기호가 깨지는 것을 방지합니다.
  snippet: |-
    from matplotlib import font_manager

    fontCandidates = ["Malgun Gothic", "AppleGothic", "NanumGothic", "DejaVu Sans"]
    availableFonts = {font.name for font in font_manager.fontManager.ttflist}
    for fontName in fontCandidates:
        if fontName in availableFonts:
            plt.rcParams["font.family"] = fontName
            break
    plt.rcParams["axes.unicode_minus"] = False
  exercise:
    prompt: 11단계. 한글 폰트 설정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      from matplotlib import font_manager

      fontCandidates = ["Malgun Gothic", "AppleGothic", "NanumGothic", "DejaVu Sans"]
      availableFonts = {font.name for font in font_manager.fontManager.ttflist}
      for fontName in fontCandidates:
          if fontName in availableFonts:
              plt.rcParams["font.family"] = fontName
              break
      plt.rcParams["axes.unicode_minus"] = False
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 한글 폰트 설정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 11단계. 한글 폰트 설정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step2_data
  title: 2단계. 주가 데이터 생성
  structuredPrimary: true
  subtitle: 시뮬레이션 데이터
  goal: 2단계. 주가 데이터 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 1년간의 가상 주가 데이터를 생성합니다. 랜덤 워크 방식으로 현실적인 주가 변동을 시뮬레이션합니다. 주요 이벤트 날짜도 정의합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    np.random.seed(42)

    days = pd.date_range('2024-01-01', periods=252, freq='B')
    returns = np.random.normal(0.001, 0.02, 252)
    price = 100 * np.cumprod(1 + returns)

    stockData = pd.DataFrame({
        'date': days,
        'price': price
    })

    stockData.head()
  exercise:
    prompt: 2단계. 주가 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      np.random.seed(42)

      days = pd.date_range('2024-01-01', periods=252, freq='B')
      returns = np.random.normal(0.001, 0.02, 252)
      price = 100 * np.cumprod(1 + returns)

      stockData = pd.DataFrame({
          'date': days,
          'price': price
      })

      stockData.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 주가 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 주가 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_basic_annotate
  title: 3단계. annotate 기본
  structuredPrimary: true
  subtitle: 화살표 주석
  goal: 3단계. annotate 기본에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    annotate는 특정 데이터 포인트에 화살표와 텍스트를 추가합니다. xy는 화살표가 가리키는 위치, xytext는 텍스트가 표시되는 위치입니다. arrowprops로 화살표 스타일을 지정합니다.

    ax.annotate(텍스트, xy=(x, y), xytext=(tx, ty), arrowprops=dict())로 화살표 주석을 추가합니다. xy는 화살표 끝점, xytext는 텍스트 시작점입니다. arrowstyle에는 '->', '-|>', '<->', 'fancy', 'wedge' 등이 있습니다.
  tips:
  - ax.annotate(텍스트, xy=(x, y), xytext=(tx, ty), arrowprops=dict())로 화살표 주석을 추가합니다. xy는 화살표 끝점, xytext는
    텍스트 시작점입니다. arrowstyle에는 '->', '-|>', '<->', 'fancy', 'wedge' 등이 있습니다.
  snippet: |-
    figAnnotate, axAnnotate = plt.subplots(figsize=(12, 6))

    axAnnotate.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

    maxIdx = stockData['price'].idxmax()
    maxDate = stockData.loc[maxIdx, 'date']
    maxPrice = stockData.loc[maxIdx, 'price']

    axAnnotate.annotate('최고점',
                       xy=(maxDate, maxPrice),
                       xytext=(maxDate - pd.Timedelta(days=30), maxPrice + 10),
                       fontsize=11,
                       arrowprops=dict(arrowstyle='->', color='#E74C3C'))

    axAnnotate.set_title('주가 추이 (기본 주석)', fontsize=14)
    axAnnotate.set_xlabel('날짜')
    axAnnotate.set_ylabel('주가 ($)')

    figAnnotate
  exercise:
    prompt: 3단계. annotate 기본 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      figAnnotate, axAnnotate = plt.subplots(figsize=(12, 6))

      axAnnotate.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

      maxIdx = stockData['price'].idxmax()
      maxDate = stockData.loc[maxIdx, 'date']
      maxPrice = stockData.loc[maxIdx, 'price']

      axAnnotate.annotate('최고점',
                         xy=(maxDate, maxPrice),
                         xytext=(maxDate - pd.Timedelta(days=30), maxPrice + 10),
                         fontsize=11,
                         arrowprops=dict(arrowstyle='->', color='#E74C3C'))

      axAnnotate.set_title('주가 추이 (기본 주석)', fontsize=14)
      axAnnotate.set_xlabel('날짜')
      axAnnotate.set_ylabel('주가 ($)')

      figAnnotate
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. annotate 기본의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. annotate 기본의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step4_arrow_styles
  title: 4단계. 다양한 화살표 스타일
  structuredPrimary: true
  subtitle: arrowprops 옵션
  goal: 4단계. 다양한 화살표 스타일에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    arrowprops에는 다양한 옵션이 있습니다. connectionstyle로 화살표 경로를 조절하고, facecolor와 edgecolor로 색상을 지정합니다. shrink로 화살표 시작/끝 여백을 조절합니다.

    connectionstyle로 화살표 곡선을 조절합니다. 'arc3,rad=0.3'은 호 형태로 rad 값이 클수록 많이 휩니다. 양수는 시계방향, 음수는 반시계방향입니다. 'angle,angleA=0,angleB=90'으로 꺾인 화살표도 가능합니다.
  tips:
  - connectionstyle로 화살표 곡선을 조절합니다. 'arc3,rad=0.3'은 호 형태로 rad 값이 클수록 많이 휩니다. 양수는 시계방향, 음수는 반시계방향입니다. 'angle,angleA=0,angleB=90'으로
    꺾인 화살표도 가능합니다.
  snippet: |-
    figArrow, axArrow = plt.subplots(figsize=(12, 7))
    axArrow.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

    minIdx = stockData['price'].idxmin()
    minDate = stockData.loc[minIdx, 'date']
    minPrice = stockData.loc[minIdx, 'price']

    axArrow.annotate('최저점',
                    xy=(minDate, minPrice),
                    xytext=(minDate + pd.Timedelta(days=40), minPrice - 5),
                    fontsize=11, fontweight='bold', color='#27AE60',
                    arrowprops=dict(arrowstyle='fancy',
                                   facecolor='#27AE60',
                                   edgecolor='none',
                                   connectionstyle='arc3,rad=0.3'))
    figArrow
  exercise:
    prompt: 4단계. 다양한 화살표 스타일 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      figArrow, axArrow = plt.subplots(figsize=(12, 7))
      axArrow.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

      minIdx = stockData['price'].idxmin()
      minDate = stockData.loc[minIdx, 'date']
      minPrice = stockData.loc[minIdx, 'price']

      axArrow.annotate('최저점',
                      xy=(minDate, minPrice),
                      xytext=(minDate + pd.Timedelta(days=40), minPrice - 5),
                      fontsize=11, fontweight='bold', color='#27AE60',
                      arrowprops=dict(arrowstyle='fancy',
                                     facecolor='#27AE60',
                                     edgecolor='none',
                                     connectionstyle='arc3,rad=0.3'))
      figArrow
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 다양한 화살표 스타일의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 4단계. 다양한 화살표 스타일의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step5_bbox
  title: 5단계. bbox 텍스트 박스
  structuredPrimary: true
  subtitle: 텍스트 강조
  goal: 5단계. bbox 텍스트 박스에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    bbox 파라미터로 텍스트 주위에 박스를 그릴 수 있습니다. boxstyle로 박스 모양을, facecolor로 배경색을, alpha로 투명도를 지정합니다. 주석 텍스트를 더 잘 보이게 만듭니다.

    bbox=dict(boxstyle='스타일', facecolor=배경색, edgecolor=테두리색)로 텍스트 박스를 만듭니다. boxstyle 옵션: 'round'(둥근 모서리), 'square'(직각), 'circle', 'rarrow'(화살표), 'sawtooth'(톱니), 'roundtooth'(둥근톱니). pad로 여백을 조절합니다.
  tips:
  - 'bbox=dict(boxstyle=''스타일'', facecolor=배경색, edgecolor=테두리색)로 텍스트 박스를 만듭니다. boxstyle 옵션: ''round''(둥근
    모서리), ''square''(직각), ''circle'', ''rarrow''(화살표), ''sawtooth''(톱니), ''roundtooth''(둥근톱니). pad로 여백을
    조절합니다.'
  snippet: |-
    figBbox, axBbox = plt.subplots(figsize=(12, 7))
    axBbox.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

    axBbox.annotate('주요 저항선 돌파',
                   xy=(maxDate, maxPrice),
                   xytext=(maxDate - pd.Timedelta(days=50), maxPrice + 12),
                   fontsize=11, fontweight='bold',
                   bbox=dict(boxstyle='round,pad=0.5',
                            facecolor='#FDEBD0',
                            edgecolor='#E67E22',
                            linewidth=2),
                   arrowprops=dict(arrowstyle='->',
                                  color='#E67E22',
                                  connectionstyle='arc3,rad=0.2'))
    figBbox
  exercise:
    prompt: 5단계. bbox 텍스트 박스 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      figBbox, axBbox = plt.subplots(figsize=(12, 7))
      axBbox.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

      axBbox.annotate('주요 저항선 돌파',
                     xy=(maxDate, maxPrice),
                     xytext=(maxDate - pd.Timedelta(days=50), maxPrice + 12),
                     fontsize=11, fontweight='bold',
                     bbox=dict(boxstyle='round,pad=0.5',
                              facecolor='#FDEBD0',
                              edgecolor='#E67E22',
                              linewidth=2),
                     arrowprops=dict(arrowstyle='->',
                                    color='#E67E22',
                                    connectionstyle='arc3,rad=0.2'))
      figBbox
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. bbox 텍스트 박스의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 5단계. bbox 텍스트 박스의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step6_latex
  title: 6단계. LaTeX 수식
  structuredPrimary: true
  subtitle: 수학 표현식
  goal: 6단계. LaTeX 수식에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    Matplotlib은 LaTeX 문법을 지원합니다. 달러 기호($) 안에 수식을 작성하면 수학 표현식으로 렌더링됩니다. 통계량, 공식, 그리스 문자 등을 표현할 수 있습니다.

    LaTeX 문법은 r'$...$' 형태로 작성합니다. r은 raw string으로 역슬래시를 이스케이프하지 않습니다. 주요 기호: \\mu(μ), \\sigma(σ), \\alpha(α), \\beta(β), \\sum(Σ), \\frac{a}{b}(분수), ^{n}(위첨자), _{n}(아래첨자).
  tips:
  - 'LaTeX 문법은 r''$...$'' 형태로 작성합니다. r은 raw string으로 역슬래시를 이스케이프하지 않습니다. 주요 기호: \\mu(μ), \\sigma(σ), \\alpha(α),
    \\beta(β), \\sum(Σ), \\frac{a}{b}(분수), ^{n}(위첨자), _{n}(아래첨자).'
  snippet: |-
    figLatex, axLatex = plt.subplots(figsize=(12, 7))
    axLatex.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

    meanPrice = stockData['price'].mean()
    stdPrice = stockData['price'].std()

    axLatex.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5, label='평균')
    axLatex.axhline(y=meanPrice + stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)
    axLatex.axhline(y=meanPrice - stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)
    figLatex
  exercise:
    prompt: 6단계. LaTeX 수식 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figLatex, axLatex = plt.subplots(figsize=(12, 7))
      axLatex.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

      meanPrice = stockData['price'].mean()
      stdPrice = stockData['price'].std()

      axLatex.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5, label='평균')
      axLatex.axhline(y=meanPrice + stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)
      axLatex.axhline(y=meanPrice - stdPrice, color='#3498DB', linestyle=':', linewidth=1.5)
      figLatex
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. LaTeX 수식의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. LaTeX 수식의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_latex_advanced
  title: 7단계. 복잡한 수식
  structuredPrimary: true
  subtitle: 공식 표현
  goal: 7단계. 복잡한 수식에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    더 복잡한 수식도 LaTeX로 표현할 수 있습니다. 분수, 제곱근, 합계 기호 등 다양한 수학 기호를 사용해봅니다. 금융 공식이나 통계 공식을 차트에 직접 표시할 수 있습니다.

    transform=ax.transAxes를 사용하면 데이터 좌표가 아닌 Axes 좌표(0~1)로 위치를 지정합니다. (0,0)은 좌하단, (1,1)은 우상단입니다. 차트 크기가 변해도 텍스트 위치가 고정됩니다.
  tips:
  - transform=ax.transAxes를 사용하면 데이터 좌표가 아닌 Axes 좌표(0~1)로 위치를 지정합니다. (0,0)은 좌하단, (1,1)은 우상단입니다. 차트 크기가
    변해도 텍스트 위치가 고정됩니다.
  snippet: |-
    figFormula, axFormula = plt.subplots(figsize=(12, 7))
    axFormula.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

    dailyReturns = stockData['price'].pct_change().dropna()
    sharpeRatio = np.sqrt(252) * dailyReturns.mean() / dailyReturns.std()
    figFormula
  exercise:
    prompt: 7단계. 복잡한 수식 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figFormula, axFormula = plt.subplots(figsize=(12, 7))
      axFormula.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5)

      dailyReturns = stockData['price'].pct_change().dropna()
      sharpeRatio = np.sqrt(252) * dailyReturns.mean() / dailyReturns.std()
      figFormula
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 복잡한 수식의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 복잡한 수식의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_errorbar
  title: 8단계. 오차 막대
  structuredPrimary: true
  subtitle: errorbar
  goal: 8단계. 오차 막대에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    errorbar는 데이터의 불확실성이나 변동성을 표현합니다. 주간 평균 주가와 함께 표준편차를 오차 막대로 표시합니다. 과학 논문이나 통계 보고서에서 자주 사용됩니다.

    ax.errorbar(x, y, yerr=오차)로 오차 막대를 그립니다. fmt='o-'는 마커와 선 스타일, ecolor는 오차 막대 색상, capsize는 캡 크기입니다. xerr로 x축 오차도 표시할 수 있습니다. yerr에 [하단오차, 상단오차] 배열을 전달하면 비대칭 오차도 가능합니다.
  tips:
  - ax.errorbar(x, y, yerr=오차)로 오차 막대를 그립니다. fmt='o-'는 마커와 선 스타일, ecolor는 오차 막대 색상, capsize는 캡 크기입니다.
    xerr로 x축 오차도 표시할 수 있습니다. yerr에 [하단오차, 상단오차] 배열을 전달하면 비대칭 오차도 가능합니다.
  snippet: |-
    stockData['week'] = stockData['date'].dt.isocalendar().week
    weeklyStats = stockData.groupby('week')['price'].agg(['mean', 'std']).reset_index()
    weeklyStats = weeklyStats.iloc[:20]
    weeklyStats.head()
  exercise:
    prompt: 8단계. 오차 막대 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      stockData['week'] = stockData['date'].dt.isocalendar().week
      weeklyStats = stockData.groupby('week')['price'].agg(['mean', 'std']).reset_index()
      weeklyStats = weeklyStats.iloc[:20]
      weeklyStats.head()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 오차 막대에서 \`weeklyStats\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 오차 막대 실행 뒤 \`weeklyStats\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step9_combined
  title: 9단계. 이벤트 차트
  structuredPrimary: true
  subtitle: 모든 기법 조합
  goal: 9단계. 이벤트 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 지금까지 배운 annotate, LaTeX, bbox, errorbar를 모두 활용하여 주요 이벤트가 표시된 전문적인 주가 차트를 만듭니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figEvent, axEvent = plt.subplots(figsize=(14, 8))
    axEvent.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5, label='일별 종가')
    axEvent.axhline(y=meanPrice, color='#95A5A6', linestyle='--', linewidth=1, alpha=0.7)

    events = [
        {'date': stockData['date'].iloc[50], 'label': '실적 발표', 'color': '#27AE60'},
        {'date': stockData['date'].iloc[120], 'label': '금리 인하', 'color': '#3498DB'},
        {'date': stockData['date'].iloc[180], 'label': '신제품 출시', 'color': '#9B59B6'}
    ]
    figEvent
  exercise:
    prompt: 9단계. 이벤트 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figEvent, axEvent = plt.subplots(figsize=(14, 8))
      axEvent.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.5, label='일별 종가')
      axEvent.axhline(y=meanPrice, color='#95A5A6', linestyle='--', linewidth=1, alpha=0.7)

      events = [
          {'date': stockData['date'].iloc[50], 'label': '실적 발표', 'color': '#27AE60'},
          {'date': stockData['date'].iloc[120], 'label': '금리 인하', 'color': '#3498DB'},
          {'date': stockData['date'].iloc[180], 'label': '신제품 출시', 'color': '#9B59B6'}
      ]
      figEvent
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 이벤트 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 이벤트 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step10_final
  title: 10단계. 최종 분석 차트
  structuredPrimary: true
  subtitle: 전문가급 차트
  goal: 10단계. 최종 분석 차트에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 모든 기법을 종합하여 논문이나 보고서에 바로 사용할 수 있는 전문가급 차트를 완성합니다. 주요 구간 표시, 통계 정보, 이벤트 주석을 모두 포함합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figFinal, axFinal = plt.subplots(figsize=(16, 9))

    axFinal.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.8, label='일별 종가')
    axFinal.fill_between(stockData['date'], meanPrice - stdPrice, meanPrice + stdPrice,
                        color='#3498DB', alpha=0.1, label=r'$\\pm 1\\sigma$ 범위')
    axFinal.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5)
    figFinal
  exercise:
    prompt: 10단계. 최종 분석 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figFinal, axFinal = plt.subplots(figsize=(16, 9))

      axFinal.plot(stockData['date'], stockData['price'], color='#2C3E50', linewidth=1.8, label='일별 종가')
      axFinal.fill_between(stockData['date'], meanPrice - stdPrice, meanPrice + stdPrice,
                          color='#3498DB', alpha=0.1, label=r'$\\pm 1\\sigma$ 범위')
      axFinal.axhline(y=meanPrice, color='#E74C3C', linestyle='--', linewidth=1.5)
      figFinal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 최종 분석 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 10단계. 최종 분석 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 고급 주석 프로젝트
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    지금까지 배운 annotate, LaTeX, bbox, errorbar를 활용해서 전문적인 분석 차트를 만들어봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import matplotlib.pyplot as plt
    import numpy as np

    np.random.seed(123)
    periods = ['Q1', 'Q2', 'Q3', 'Q4']
    sales = np.array([120, 145, 138, 165])
    margin = np.array([8, 12, 10, 15])
  exercise:
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      import matplotlib.pyplot as plt
      import numpy as np

      np.random.seed(123)
      periods = ['Q1', 'Q2', 'Q3', 'Q4']
      sales = np.array([120, 145, 138, 165])
      margin = np.array([8, 12, 10, 15])
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 실습에서 \`periods\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: annotate, LaTeX, bbox, errorbar로 고급 주석 차트를 만들었습니다.
  - type: list
    items:
    - ax.annotate(text, xy, xytext, arrowprops) - 화살표 주석
    - 'arrowstyle: ''->'', ''fancy'', ''wedge'' 등 다양한 스타일'
    - 'connectionstyle: ''arc3,rad=0.3'' 곡선 화살표'
    - bbox=dict(boxstyle, facecolor, edgecolor) - 텍스트 박스
    - r'$\\mu$', r'$\\sigma$' - LaTeX 수식 표현
    - transform=ax.transAxes - Axes 좌표 사용
    - ax.errorbar(x, y, yerr) - 오차 막대 차트
  - type: text
    content: 다음 시간에는 모든 개념을 종합한 분석 리포트를 만듭니다.
  goal: 정리에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: 보고서 차트 품질 게이트
  goal: 업무 흐름 검증에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: Matplotlib 학습은 차트를 그리는 데서 끝나면 부족합니다. 업무용 차트는 입력 데이터가 맞는지 검증하고, 잘못된 컬럼이나 음수 금액을 오류로 막고,
    제목·축·범례·기준선이 실제 보고서 기준을 만족하는지 확인해야 합니다. 마지막에는 목표선을 바꾸는 변주로 메시지가 어떻게 달라지는지 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pandas as pd
    import matplotlib.pyplot as plt

    reportData = pd.DataFrame({
        "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "revenue": [82, 91, 105, 112, 121, 130],
        "cost": [55, 58, 62, 64, 68, 72],
        "target": [100, 100, 100, 100, 100, 100],
    })

    def validateChartFrame(frame: pd.DataFrame) -> bool:
        requiredColumns = {"month", "revenue", "cost", "target"}
        missingColumns = requiredColumns - set(frame.columns)
        if missingColumns:
            raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")
        if frame[["revenue", "cost", "target"]].lt(0).any().any():
            raise ValueError("금액 컬럼은 음수가 될 수 없습니다.")
        return True

    validateChartFrame(reportData)
    reportData
  exercise:
    prompt: 업무 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      targetScenario = pd.DataFrame({"target": [95, 100, 115]}).assign(
          monthsPassed=lambda frame: frame["target"].map(lambda target: int((reportData["revenue"] >= target).sum()))
      )

      assert targetScenario["monthsPassed"].is_monotonic_decreasing
      targetScenario
    solution: |-
      import pandas as pd
      import matplotlib.pyplot as plt

      reportData = pd.DataFrame({
          "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          "revenue": [82, 91, 105, 112, 121, 130],
          "cost": [55, 58, 62, 64, 68, 72],
          "target": [100, 100, 100, 100, 100, 100],
      })

      def validateChartFrame(frame: pd.DataFrame) -> bool:
          requiredColumns = {"month", "revenue", "cost", "target"}
          missingColumns = requiredColumns - set(frame.columns)
          if missingColumns:
              raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")
          if frame[["revenue", "cost", "target"]].lt(0).any().any():
              raise ValueError("금액 컬럼은 음수가 될 수 없습니다.")
          return True

      validateChartFrame(reportData)
      reportData
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 업무 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 업무 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: matplotlib_09-annotation-evidence-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 고급 주석 차트 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 주석이 데이터 근거와 정확히 연결되는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_annotation_evidence(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_annotation_evidence(rows):
            raise NotImplementedError
      solution: |
        def prepare_annotation_evidence(rows):
            required = ['date', 'value', 'eventType']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'eventType'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['date'] for row in usable]
            y_values = [row['value'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.matplotlib.matplotlib_09.annotation-evidence-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_09.annotation-evidence-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_annotation_evidence
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - date: '01'
              value: 10
              eventType: none
            - date: '02'
              value: 18
              eventType: release
            - date: '03'
              value: null
              eventType: incident
          expectedReturn:
            usableCount: 2
            excludedCount: 1
            groupCounts:
              none: 1
              release: 1
            xExtent:
            - '01'
            - '02'
            yExtent:
            - 10
            - 18
        - id: handles-empty-data
          arguments:
          - value: []
          expectedReturn:
            usableCount: 0
            excludedCount: 0
            groupCounts: {}
            xExtent: null
            yExtent: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: matplotlib_09-annotation-evidence-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - matplotlib_09-annotation-evidence-data-evidence-mastery
    title: 고급 주석 차트 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 배포와 장애 이벤트를 서비스 지표 선 위에 근거 ID와 함께 주석 처리한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_annotation_evidence(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_annotation_evidence(candidate):
            raise NotImplementedError
      solution: |
        def audit_annotation_evidence(candidate):
            expected = {'mark': 'annotated-line', 'x': 'date', 'y': 'value', 'group': 'eventType', 'transforms': ['join-events', 'sort-date'], 'interaction': 'none'}
            errors = []
            for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
                actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
                if actual != expected[name]:
                    errors.append(name)
            if not str(candidate.get("description", "")).strip():
                errors.append("description")
            return {"valid": not errors, "errors": errors, "encoding": expected}
      hints: *id002
    check:
      id: python.matplotlib.matplotlib_09.annotation-evidence-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_09.annotation-evidence-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_annotation_evidence
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: annotated-line
              x: date
              y: value
              group: eventType
              transforms:
              - join-events
              - sort-date
              interaction: none
              description: 배포와 장애 이벤트를 서비스 지표 선 위에 근거 ID와 함께 주석 처리한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: annotated-line
              x: date
              y: value
              group: eventType
              transforms:
              - join-events
              - sort-date
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: value
              y: date
              group: null
              transforms: []
              interaction: none
              description: ''
          expectedReturn:
            valid: false
            errors:
            - mark
            - x
            - y
            - group
            - transforms
            - description
            encoding:
              mark: annotated-line
              x: date
              y: value
              group: eventType
              transforms:
              - join-events
              - sort-date
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: matplotlib_09-annotation-evidence-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - matplotlib_09-annotation-evidence-encoding-transfer-transfer
    title: 고급 주석 차트 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 주석이 데이터 근거와 정확히 연결되는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_annotation_evidence(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_annotation_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_annotation_evidence(situation):
            table = {'known-event': {'encoding': 'anchored annotation', 'evidence': 'event id and timestamp', 'risk': 'implied causation'}, 'threshold-crossing': {'encoding': 'rule plus label', 'evidence': 'threshold definition', 'risk': 'cherry-picked cutoff'}, 'many-events': {'encoding': 'interactive detail or separate table', 'evidence': 'event count', 'risk': 'label collision'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.matplotlib.matplotlib_09.annotation-evidence-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_09.annotation-evidence-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_annotation_evidence
        cases:
        - id: recalls-known-event
          arguments:
          - value: known-event
          expectedReturn:
            encoding: anchored annotation
            evidence: event id and timestamp
            risk: implied causation
        - id: recalls-threshold-crossing
          arguments:
          - value: threshold-crossing
          expectedReturn:
            encoding: rule plus label
            evidence: threshold definition
            risk: cherry-picked cutoff
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};