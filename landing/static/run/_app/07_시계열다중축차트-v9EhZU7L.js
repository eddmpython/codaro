var e=`meta:
  packages:
  - matplotlib
  - numpy
  - pandas
  id: matplotlib_07
  title: 시계열다중축차트
  order: 7
  category: matplotlib
  difficulty: ⭐⭐⭐
  badge: 중급
  outcomes: ["matplotlib.advanced"]
  prerequisites: ["matplotlib.basics"]
  estimatedMinutes: 55
  tags:
  - matplotlib
  - twinx
  - fill_between
  - 시계열
  - 이중축
  seo:
    title: Matplotlib 이중 축 차트 - 온도와 강수량 시각화
    description: Matplotlib으로 온도와 강수량을 이중 축 차트로 시각화합니다. twinx, fill_between, 시계열 분석 기법을 배웁니다.
    keywords:
    - matplotlib
    - twinx
    - 이중축
    - fill_between
    - 시계열
    - 날씨
intro:
  emoji: 🌡️
  goal: 온도와 강수량을 이중 축 차트로 시각화합니다.
  description: 서로 다른 단위의 변수를 한 차트에 표시할 때 이중 축을 사용합니다. twinx()로 y축을 추가하고, fill_between()으로 영역을 채웁니다. 이전에
    배운 plot, bar, scatter, subplots, legend 개념을 함께 활용합니다.
  direction: 시계열다중축차트에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.
  benefits:
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.
  - 시계열다중축차트 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 11단계. 한글 폰트 설정 처리 실행
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 2단계. 날씨 데이터 생성 결과 검증
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.
    - label: 시계열다중축차트 재사용
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 시각 리포트 환경
      detail: matplotlib, numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 시계열다중축차트 실행
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.
    - label: 시계열다중축차트 완료
      detail: 검증된 코드를 보고서 차트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    가상의 월별 날씨 데이터를 생성하여 시계열 분석을 연습합니다. 온도(°C)와 강수량(mm)은 단위와 스케일이 완전히 다르므로, 이중 축을 사용해야 두 변수를 효과적으로 비교할 수 있습니다.

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
  title: 2단계. 날씨 데이터 생성
  structuredPrimary: true
  subtitle: 시뮬레이션 데이터
  goal: 2단계. 날씨 데이터 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 한국의 전형적인 기후 패턴을 반영한 가상 데이터를 생성합니다. 여름(7-8월)에 고온다습하고, 겨울(12-2월)에 건조한 계절 변화를 담습니다. 실제 기상청
    데이터와 유사한 패턴입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    np.random.seed(42)
    months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

    temperature = np.array([-2, 1, 7, 14, 19, 24, 27, 28, 23, 16, 8, 1]) + np.random.randn(12) * 1.5
    rainfall = np.array([20, 25, 45, 65, 100, 135, 380, 320, 145, 50, 45, 25]) + np.random.randn(12) * 15

    weatherData = pd.DataFrame({
        'month': months,
        'temp': temperature,
        'rain': rainfall
    })
    weatherData
  exercise:
    prompt: 2단계. 날씨 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      np.random.seed(42)
      months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

      temperature = np.array([-2, 1, 7, 14, 19, 24, 27, 28, 23, 16, 8, 1]) + np.random.randn(12) * 1.5
      rainfall = np.array([20, 25, 45, 65, 100, 135, 380, 320, 145, 50, 45, 25]) + np.random.randn(12) * 15

      weatherData = pd.DataFrame({
          'month': months,
          'temp': temperature,
          'rain': rainfall
      })
      weatherData
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 날씨 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 날씨 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_single
  title: 3단계. 단일 축의 문제점
  structuredPrimary: true
  subtitle: 스케일 차이
  goal: 3단계. 단일 축의 문제점에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 온도와 강수량을 같은 y축에 표시하면 스케일 차이로 인해 제대로 비교할 수 없습니다. 온도는 -5~30 범위인데 강수량은 0~400 범위이므로, 온도 변화가
    거의 보이지 않게 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figSingle, axSingle = plt.subplots(figsize=(10, 6))
    axSingle.plot(weatherData['month'], weatherData['temp'], 'o-', label='온도')
    axSingle.plot(weatherData['month'], weatherData['rain'], 's-', label='강수량')
    axSingle.set_title('단일 축의 문제점', fontsize=14)
    axSingle.legend()
    figSingle
  exercise:
    prompt: 3단계. 단일 축의 문제점 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figSingle, axSingle = plt.subplots(figsize=(10, 6))
      axSingle.plot(weatherData['month'], weatherData['temp'], 'o-', label='온도')
      axSingle.plot(weatherData['month'], weatherData['rain'], 's-', label='강수량')
      axSingle.set_title('단일 축의 문제점', fontsize=14)
      axSingle.legend()
      figSingle
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 단일 축의 문제점의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 3단계. 단일 축의 문제점 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step4_twinx
  title: 4단계. 이중 축 생성
  structuredPrimary: true
  subtitle: ax.twinx()
  goal: 4단계. 이중 축 생성에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    twinx()는 기존 Axes와 x축을 공유하는 새로운 Axes를 생성합니다. 이 새로운 축은 오른쪽에 y축을 가지며, 독립적인 스케일을 사용합니다. 이제 온도와 강수량을 각각의 적절한 스케일로 표시할 수 있습니다.

    ax.twinx()는 x축을 공유하는 새 Axes를 반환합니다. ax.twiny()는 y축을 공유합니다. 두 축의 색상을 다르게 설정하면 어느 축이 어느 데이터인지 쉽게 구분할 수 있습니다. tick_params(labelcolor)로 눈금 라벨 색상을 맞춥니다.
  tips:
  - ax.twinx()는 x축을 공유하는 새 Axes를 반환합니다. ax.twiny()는 y축을 공유합니다. 두 축의 색상을 다르게 설정하면 어느 축이 어느 데이터인지 쉽게 구분할
    수 있습니다. tick_params(labelcolor)로 눈금 라벨 색상을 맞춥니다.
  snippet: |-
    figTwin, ax1 = plt.subplots(figsize=(10, 6))

    ax1.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도')
    ax1.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
    ax1.tick_params(axis='y', labelcolor='#E74C3C')
    figTwin
  exercise:
    prompt: 4단계. 이중 축 생성 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figTwin, ax1 = plt.subplots(figsize=(10, 6))

      ax1.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도')
      ax1.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
      ax1.tick_params(axis='y', labelcolor='#E74C3C')
      figTwin
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 이중 축 생성의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 4단계. 이중 축 생성 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step5_legend
  title: 5단계. 범례 통합
  structuredPrimary: true
  subtitle: 두 축의 범례 합치기
  goal: 5단계. 범례 통합에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 이중 축 차트에서 두 데이터의 범례를 하나로 합치려면 각 축에서 범례 정보를 가져와 합쳐야 합니다. get_legend_handles_labels()로 핸들과
    라벨을 추출한 후 합쳐서 legend()에 전달합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figLegend, ax1Legend = plt.subplots(figsize=(10, 6))

    line1, = ax1Legend.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도 (°C)')
    ax1Legend.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
    ax1Legend.tick_params(axis='y', labelcolor='#E74C3C')
    figLegend
  exercise:
    prompt: 5단계. 범례 통합 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figLegend, ax1Legend = plt.subplots(figsize=(10, 6))

      line1, = ax1Legend.plot(weatherData['month'], weatherData['temp'], 'o-', color='#E74C3C', label='온도 (°C)')
      ax1Legend.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
      ax1Legend.tick_params(axis='y', labelcolor='#E74C3C')
      figLegend
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 범례 통합의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 5단계. 범례 통합 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step6_fill
  title: 6단계. 영역 채우기
  structuredPrimary: true
  subtitle: fill_between()
  goal: 6단계. 영역 채우기에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    fill_between()은 선 그래프 아래 영역을 색상으로 채웁니다. 온도 변화를 영역으로 표시하면 시각적 임팩트가 커집니다. alpha로 투명도를 조절하여 뒤의 막대 그래프가 보이도록 합니다.

    fill_between(x, y)은 y=0부터 y값까지의 영역을 채웁니다. fill_between(x, y1, y2)로 두 선 사이 영역도 채울 수 있습니다. set_zorder()로 레이어 순서를 조절하고, patch.set_visible(False)로 배경을 투명하게 만들어 뒤의 차트가 보이게 합니다.
  tips:
  - fill_between(x, y)은 y=0부터 y값까지의 영역을 채웁니다. fill_between(x, y1, y2)로 두 선 사이 영역도 채울 수 있습니다. set_zorder()로
    레이어 순서를 조절하고, patch.set_visible(False)로 배경을 투명하게 만들어 뒤의 차트가 보이게 합니다.
  snippet: |-
    figFill, ax1Fill = plt.subplots(figsize=(10, 6))
    xPos = range(len(months))

    ax1Fill.fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C', label='온도 (°C)')
    ax1Fill.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C')
    ax1Fill.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
    ax1Fill.tick_params(axis='y', labelcolor='#E74C3C')
    ax1Fill.set_xticks(xPos)
    ax1Fill.set_xticklabels(months)
    figFill
  exercise:
    prompt: 6단계. 영역 채우기 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figFill, ax1Fill = plt.subplots(figsize=(10, 6))
      xPos = range(len(months))

      ax1Fill.fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C', label='온도 (°C)')
      ax1Fill.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C')
      ax1Fill.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
      ax1Fill.tick_params(axis='y', labelcolor='#E74C3C')
      ax1Fill.set_xticks(xPos)
      ax1Fill.set_xticklabels(months)
      figFill
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 영역 채우기의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. 영역 채우기의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_style
  title: 7단계. 스타일링
  structuredPrimary: true
  subtitle: 색상과 선 스타일
  goal: 7단계. 스타일링에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 차트의 가독성을 높이기 위해 스타일을 세밀하게 조정합니다. 그리드, 마커 스타일, 범례 위치 등을 설정하여 전문적인 시각화를 만듭니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figStyle, ax1Style = plt.subplots(figsize=(12, 6))
    xPos = range(len(months))

    ax1Style.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')
    line1, = ax1Style.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',
                          linewidth=2, markersize=8, label='온도 (°C)')
    ax1Style.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
    ax1Style.tick_params(axis='y', labelcolor='#E74C3C')
    ax1Style.set_ylim(-10, 35)
    ax1Style.set_xticks(xPos)
    ax1Style.set_xticklabels(months)
    figStyle
  exercise:
    prompt: 7단계. 스타일링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figStyle, ax1Style = plt.subplots(figsize=(12, 6))
      xPos = range(len(months))

      ax1Style.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')
      line1, = ax1Style.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',
                            linewidth=2, markersize=8, label='온도 (°C)')
      ax1Style.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
      ax1Style.tick_params(axis='y', labelcolor='#E74C3C')
      ax1Style.set_ylim(-10, 35)
      ax1Style.set_xticks(xPos)
      ax1Style.set_xticklabels(months)
      figStyle
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 스타일링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 스타일링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_annotation
  title: 8단계. 주석 추가
  structuredPrimary: true
  subtitle: 최고/최저 표시
  goal: 8단계. 주석 추가에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 최고 온도, 최대 강수량 등 주요 포인트에 주석을 추가하면 차트의 정보 전달력이 높아집니다. annotate()로 화살표와 함께 텍스트를 배치합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figAnnot, ax1Annot = plt.subplots(figsize=(12, 7))
    xPos = range(len(months))

    ax1Annot.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')
    ax1Annot.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2, markersize=8)
    ax1Annot.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
    ax1Annot.tick_params(axis='y', labelcolor='#E74C3C')
    ax1Annot.set_xticks(xPos)
    ax1Annot.set_xticklabels(months)
    figAnnot
  exercise:
    prompt: 8단계. 주석 추가 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figAnnot, ax1Annot = plt.subplots(figsize=(12, 7))
      xPos = range(len(months))

      ax1Annot.fill_between(xPos, weatherData['temp'], alpha=0.2, color='#E74C3C')
      ax1Annot.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2, markersize=8)
      ax1Annot.set_ylabel('온도 (°C)', color='#E74C3C', fontsize=12)
      ax1Annot.tick_params(axis='y', labelcolor='#E74C3C')
      ax1Annot.set_xticks(xPos)
      ax1Annot.set_xticklabels(months)
      figAnnot
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 주석 추가의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 주석 추가의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step9_subplots
  title: 9단계. 서브플롯 비교
  structuredPrimary: true
  subtitle: 이중 축 vs 분리
  goal: 9단계. 서브플롯 비교에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 이중 축 차트와 분리된 서브플롯을 비교합니다. 상황에 따라 어떤 방식이 더 효과적인지 판단할 수 있습니다. 분리된 서브플롯은 각 변수를 더 자세히 볼 수 있고,
    이중 축은 관계를 직접 비교할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figCompare, axes = plt.subplots(2, 1, figsize=(12, 10), sharex=True)
    xPos = range(len(months))

    axes[0].fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C')
    axes[0].plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2)
    axes[0].set_ylabel('온도 (°C)', fontsize=12)
    axes[0].set_title('월별 기온 변화', fontsize=12)
    axes[0].grid(True, alpha=0.3, linestyle='--')
    axes[0].axhline(y=0, color='gray', linestyle='-', alpha=0.5)
    figCompare
  exercise:
    prompt: 9단계. 서브플롯 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figCompare, axes = plt.subplots(2, 1, figsize=(12, 10), sharex=True)
      xPos = range(len(months))

      axes[0].fill_between(xPos, weatherData['temp'], alpha=0.3, color='#E74C3C')
      axes[0].plot(xPos, weatherData['temp'], 'o-', color='#E74C3C', linewidth=2)
      axes[0].set_ylabel('온도 (°C)', fontsize=12)
      axes[0].set_title('월별 기온 변화', fontsize=12)
      axes[0].grid(True, alpha=0.3, linestyle='--')
      axes[0].axhline(y=0, color='gray', linestyle='-', alpha=0.5)
      figCompare
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 서브플롯 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 서브플롯 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step10_final
  title: 10단계. 최종 시각화
  structuredPrimary: true
  subtitle: 완성된 이중 축 차트
  goal: 10단계. 최종 시각화에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 지금까지 배운 모든 요소를 종합하여 완성도 높은 시계열 이중 축 차트를 만듭니다. 전문적인 스타일과 명확한 주석으로 기상 분석 보고서에 바로 사용할 수 있는
    품질입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figFinal, ax1Final = plt.subplots(figsize=(13, 7))
    xPos = range(len(months))

    ax1Final.fill_between(xPos, weatherData['temp'], alpha=0.15, color='#E74C3C')
    ax1Final.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',
                 linewidth=2.5, markersize=9, label='평균 기온')
    ax1Final.set_ylabel('기온 (°C)', color='#E74C3C', fontsize=13)
    ax1Final.tick_params(axis='y', labelcolor='#E74C3C')
    ax1Final.set_ylim(-10, 40)
    ax1Final.axhline(y=0, color='gray', linestyle='-', alpha=0.3)
    ax1Final.set_xticks(xPos)
    ax1Final.set_xticklabels(months, fontsize=11)
    figFinal
  exercise:
    prompt: 10단계. 최종 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figFinal, ax1Final = plt.subplots(figsize=(13, 7))
      xPos = range(len(months))

      ax1Final.fill_between(xPos, weatherData['temp'], alpha=0.15, color='#E74C3C')
      ax1Final.plot(xPos, weatherData['temp'], 'o-', color='#E74C3C',
                   linewidth=2.5, markersize=9, label='평균 기온')
      ax1Final.set_ylabel('기온 (°C)', color='#E74C3C', fontsize=13)
      ax1Final.tick_params(axis='y', labelcolor='#E74C3C')
      ax1Final.set_ylim(-10, 40)
      ax1Final.axhline(y=0, color='gray', linestyle='-', alpha=0.3)
      ax1Final.set_xticks(xPos)
      ax1Final.set_xticklabels(months, fontsize=11)
      figFinal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 최종 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 10단계. 최종 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 시계열 분석 프로젝트
  goal: 실습에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 내용을 활용해서 다양한 시계열 데이터를 분석해봅시다. twinx, fill_between, annotate 등 모든 개념을 종합적으로 활용합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd

    np.random.seed(123)
    days = 30
    dates = pd.date_range('2024-01-01', periods=days, freq='D')
    price = 50000 + np.random.randn(days).cumsum() * 500
    volume = np.random.randint(100000, 500000, days)
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import matplotlib.pyplot as plt
      import numpy as np
      import pandas as pd

      np.random.seed(123)
      days = 30
      dates = pd.date_range('2024-01-01', periods=days, freq='D')
      price = 50000 + np.random.randn(days).cumsum() * 500
      volume = np.random.randint(100000, 500000, days)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: 이중 축 차트로 서로 다른 단위의 시계열 데이터를 시각화했습니다.
  - type: list
    items:
    - ax.twinx() - x축을 공유하는 오른쪽 y축 생성
    - ax.twiny() - y축을 공유하는 위쪽 x축 생성
    - fill_between(x, y) - 선 아래 영역 채우기
    - get_legend_handles_labels() - 범례 정보 추출
    - set_zorder() - 레이어 순서 조절
    - tick_params(labelcolor) - 축 눈금 색상 설정
  - type: text
    content: 다음 시간에는 GridSpec으로 복잡한 다중 패널 대시보드를 만듭니다.
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
  - id: matplotlib_07-dual-axis-time-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 다중축 시계열 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 서로 다른 단위가 같은 추세처럼 보이지 않게 했는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_dual_axis_time(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_dual_axis_time(rows):
            raise NotImplementedError
      solution: |
        def prepare_dual_axis_time(rows):
            required = ['date', 'normalizedValue', 'metric']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'metric'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['date'] for row in usable]
            y_values = [row['normalizedValue'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.matplotlib.matplotlib_07.dual-axis-time-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_07.dual-axis-time-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_dual_axis_time
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - date: '01'
              normalizedValue: 100
              metric: sales
            - date: '02'
              normalizedValue: 110
              metric: sales
            - date: '01'
              normalizedValue: 100
              metric: temperature
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              sales: 2
              temperature: 1
            xExtent:
            - '01'
            - '02'
            yExtent:
            - 100
            - 110
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
  - id: matplotlib_07-dual-axis-time-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - matplotlib_07-dual-axis-time-data-evidence-mastery
    title: 다중축 시계열 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 트래픽과 오류율을 공통 기준일 index로 정규화해 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_dual_axis_time(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_dual_axis_time(candidate):
            raise NotImplementedError
      solution: |
        def audit_dual_axis_time(candidate):
            expected = {'mark': 'line', 'x': 'date', 'y': 'normalizedValue', 'group': 'metric', 'transforms': ['normalize-base', 'sort-date'], 'interaction': 'none'}
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
      id: python.matplotlib.matplotlib_07.dual-axis-time-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_07.dual-axis-time-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_dual_axis_time
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: line
              x: date
              y: normalizedValue
              group: metric
              transforms:
              - normalize-base
              - sort-date
              interaction: none
              description: 트래픽과 오류율을 공통 기준일 index로 정규화해 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: line
              x: date
              y: normalizedValue
              group: metric
              transforms:
              - normalize-base
              - sort-date
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: normalizedValue
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
              mark: line
              x: date
              y: normalizedValue
              group: metric
              transforms:
              - normalize-base
              - sort-date
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: matplotlib_07-dual-axis-time-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - matplotlib_07-dual-axis-time-encoding-transfer-transfer
    title: 다중축 시계열 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 서로 다른 단위가 같은 추세처럼 보이지 않게 했는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_dual_axis_time(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_dual_axis_time(situation):
            raise NotImplementedError
      solution: |
        def choose_dual_axis_time(situation):
            table = {'different-units': {'encoding': 'small multiples or normalized lines', 'evidence': 'unit labels', 'risk': 'dual-axis correlation illusion'}, 'same-unit-series': {'encoding': 'shared-axis lines', 'evidence': 'common domain', 'risk': 'too many series'}, 'rate-and-count': {'encoding': 'separate panels', 'evidence': 'linked time axis', 'risk': 'scale manipulation'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.matplotlib.matplotlib_07.dual-axis-time-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_07.dual-axis-time-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_dual_axis_time
        cases:
        - id: recalls-different-units
          arguments:
          - value: different-units
          expectedReturn:
            encoding: small multiples or normalized lines
            evidence: unit labels
            risk: dual-axis correlation illusion
        - id: recalls-same-unit-series
          arguments:
          - value: same-unit-series
          expectedReturn:
            encoding: shared-axis lines
            evidence: common domain
            risk: too many series
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};