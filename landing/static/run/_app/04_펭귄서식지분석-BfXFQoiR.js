var e=`meta:
  packages:
  - altair
  - pandas
  id: altair_04
  title: 펭귄서식지분석
  order: 4
  category: altair
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - mark_area
  - layer
  - stack
  - penguins
  seo:
    title: Altair 영역 차트 - 펭귄 서식지 분석
    description: Altair로 영역 차트를 만들고 레이어를 활용합니다. mark_area, layer, 스택 시각화를 배웁니다.
    keywords:
    - altair area
    - mark_area
    - layer
    - stacked chart
intro:
  emoji: 🐧
  goal: 펭귄 3종(Adelie, Chinstrap, Gentoo)의 서식지와 신체 특성을 영역 차트로 분석합니다.
  description: mark_area()로 영역 차트를 만들고, layer(+)로 여러 차트를 겹쳐서 표현합니다.
  direction: 펭귄서식지분석에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.
  benefits:
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.
  - 펭귄서식지분석 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 불러오기 입력 확인
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 영역 차트 처리 실행
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 스택 영역 차트 결과 검증
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.
    - label: 펭귄서식지분석 재사용
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.
    runtime:
    - label: 선언형 차트 환경
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 펭귄서식지분석 실행
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.
    - label: 펭귄서식지분석 완료
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: seaborn-data
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: Codaro 로컬 데이터셋에서 penguins 데이터를 불러옵니다. 남극 3개 섬에 사는 펭귄의 측정 데이터입니다. species(종), island(섬),
    bill_length_mm(부리 길이), bill_depth_mm(부리 깊이), flipper_length_mm(지느러미 길이), body_mass_g(체중), sex(성별)
    컬럼이 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import altair as alt
    import pandas as pd
    import warnings
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')
    from codaro.curriculum.localData import loadLocalDataset

    penguins = loadLocalDataset("penguins")
  exercise:
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      import pandas as pd
      import warnings
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')
      from codaro.curriculum.localData import loadLocalDataset

      penguins = loadLocalDataset("penguins")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_basic_area
  title: 2단계. 기본 영역 차트
  structuredPrimary: true
  subtitle: mark_area()
  goal: 2단계. 기본 영역 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    mark_area()는 선 아래 영역을 채운 차트를 만듭니다. mark_bar()가 막대를 그리는 것처럼, mark_area()는 영역을 그립니다. 종(species)별 펭귄 수를 영역 차트로 표현합니다. x축에 종, y축에 개수(count())를 배치합니다. 영역 차트는 막대 차트와 비슷하지만 더 부드럽게 보이며, 연속적인 흐름을 표현할 때 유용합니다.

    mark_area()는 mark_bar()와 비슷하지만 부드러운 곡선으로 영역을 채웁니다. 연속적인 데이터 흐름을 표현할 때 유용합니다.
  snippet: |-
    chartArea = alt.Chart(penguins).mark_area().encode(
        x='species:N',
        y='count()'
    )
    chartArea
  exercise:
    prompt: 2단계. 기본 영역 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartArea = alt.Chart(penguins).mark_area().encode(
          x='species:N',
          y='count()'
      )
      chartArea
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 2단계. 기본 영역 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 2단계. 기본 영역 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step3_stacked_area
  title: 3단계. 스택 영역 차트
  structuredPrimary: true
  subtitle: color로 쌓기
  goal: 3단계. 스택 영역 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    color 인코딩을 추가하면 종별 영역을 구분할 수 있습니다. 로컬 penguins 샘플은 섬마다 한 종만 배치되어 있어 실제 결과는 섬별 단일 색 영역으로 보입니다.

    Biscoe 섬에는 Gentoo, Dream 섬에는 Chinstrap, Torgersen 섬에는 Adelie 샘플이 들어 있습니다.
  snippet: |-
    chartStacked = alt.Chart(penguins).mark_area().encode(
        x='island:N',
        y='count()',
        color='species:N'
    )
    chartStacked
  exercise:
    prompt: 3단계. 스택 영역 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartStacked = alt.Chart(penguins).mark_area().encode(
          x='island:N',
          y='count()',
          color='species:N'
      )
      chartStacked
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 3단계. 스택 영역 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 스택 영역 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step4_opacity
  title: 4단계. 투명도 조절
  structuredPrimary: true
  subtitle: opacity 파라미터
  goal: 4단계. 투명도 조절에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 영역이 겹칠 때 opacity(투명도)를 조절하면 아래 데이터도 볼 수 있습니다. mark_area()에 opacity 파라미터를 추가합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    chartOpacity = alt.Chart(penguins).mark_area(
        opacity=0.6
    ).encode(
        x='island:N',
        y='count()',
        color='species:N'
    )
    chartOpacity
  exercise:
    prompt: 4단계. 투명도 조절 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartOpacity = alt.Chart(penguins).mark_area(
          opacity=0.6
      ).encode(
          x='island:N',
          y='count()',
          color='species:N'
      )
      chartOpacity
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 4단계. 투명도 조절의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 4단계. 투명도 조절의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step5_layer_intro
  title: 5단계. 레이어 개념
  structuredPrimary: true
  subtitle: + 연산자
  goal: 5단계. 레이어 개념에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    Altair에서 + 연산자로 여러 차트를 겹칠 수 있습니다. 이를 레이어(layer)라고 합니다. 더하기(+) 기호로 차트를 합칩니다. 먼저 scatter라는 변수에 산점도를 만들고, meanLine이라는 변수에 평균선을 만듭니다. 그다음 scatter + meanLine으로 두 차트를 겹칩니다. mark_rule()은 선을 그리는 함수입니다. y만 지정하면 가로선, x만 지정하면 세로선이 됩니다. color='red'로 선 색상을, strokeWidth=2로 선 굵기를 지정합니다.

    같은 셀 안에서 여러 변수를 만들 수 있습니다. scatter = ... 후 meanLine = ... 후 chartLayer = ...처럼 여러 줄에 걸쳐 변수를 선언합니다. 마지막 줄(chartLayer)이 출력됩니다. 이것은 scatter + meanLine으로 두 차트를 합친 결과입니다.
  tips:
  - 같은 셀 안에서 여러 변수를 만들 수 있습니다. scatter = ... 후 meanLine = ... 후 chartLayer = ...처럼 여러 줄에 걸쳐 변수를 선언합니다.
    마지막 줄(chartLayer)이 출력됩니다. 이것은 scatter + meanLine으로 두 차트를 합친 결과입니다.
  snippet: |-
    scatter = alt.Chart(penguins).mark_circle(opacity=0.6).encode(
        x='bill_length_mm:Q',
        y='bill_depth_mm:Q',
        color='species:N'
    )

    meanLine = alt.Chart(penguins).mark_rule(color='red', strokeWidth=2).encode(
        y='mean(bill_depth_mm):Q'
    )

    chartLayer = scatter + meanLine
    chartLayer
  exercise:
    prompt: 5단계. 레이어 개념 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      scatter = alt.Chart(penguins).mark_circle(opacity=0.6).encode(
          x='bill_length_mm:Q',
          y='bill_depth_mm:Q',
          color='species:N'
      )

      meanLine = alt.Chart(penguins).mark_rule(color='red', strokeWidth=2).encode(
          y='mean(bill_depth_mm):Q'
      )

      chartLayer = scatter + meanLine
      chartLayer
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 5단계. 레이어 개념의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 5단계. 레이어 개념의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step6_layer_text
  title: 6단계. 텍스트 레이어
  structuredPrimary: true
  subtitle: mark_text()
  goal: 6단계. 텍스트 레이어에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    막대 차트 위에 값을 텍스트로 표시할 수 있습니다. mark_text()는 텍스트를 그리는 함수입니다. bars 변수에 막대 차트를, text 변수에 텍스트 차트를 만들고, bars + text로 합칩니다. mark_text()의 dy=-10은 텍스트를 위로 10픽셀 이동시킵니다. dy는 delta y(y 변화량)의 약자입니다. 음수는 위로, 양수는 아래로 이동합니다. encode()에서 text='count()'는 표시할 텍스트 내용을 지정합니다. count() 값이 숫자로 표시됩니다.

    (weightBars + weightText)를 괄호로 감싸고 .properties()를 연결할 수 있습니다. 괄호는 두 차트를 먼저 합친 후 properties를 적용하라는 의미입니다. 괄호 없이 weightBars + weightText.properties(...)처럼 쓰면 weightText에만 properties가 적용됩니다.
  tips:
  - (weightBars + weightText)를 괄호로 감싸고 .properties()를 연결할 수 있습니다. 괄호는 두 차트를 먼저 합친 후 properties를 적용하라는
    의미입니다. 괄호 없이 weightBars + weightText.properties(...)처럼 쓰면 weightText에만 properties가 적용됩니다.
  snippet: |-
    bars = alt.Chart(penguins).mark_bar().encode(
        x='species:N',
        y='count()',
        color='species:N'
    )

    text = alt.Chart(penguins).mark_text(
        dy=-10,
        fontSize=14
    ).encode(
        x='species:N',
        y='count()',
        text='count()'
    )

    chartWithText = bars + text
    chartWithText
  exercise:
    prompt: 6단계. 텍스트 레이어 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      bars = alt.Chart(penguins).mark_bar().encode(
          x='species:N',
          y='count()',
          color='species:N'
      )

      text = alt.Chart(penguins).mark_text(
          dy=-10,
          fontSize=14
      ).encode(
          x='species:N',
          y='count()',
          text='count()'
      )

      chartWithText = bars + text
      chartWithText
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 6단계. 텍스트 레이어의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. 텍스트 레이어의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_body_analysis
  title: 7단계. 신체 특성 분석
  structuredPrimary: true
  subtitle: 종별 체중 비교
  goal: 7단계. 신체 특성 분석에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 지금까지 배운 내용으로 펭귄 종별 신체 특성을 분석합니다. 종별 평균 체중을 막대 차트로 시각화하고 텍스트 레이블을 추가합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    weightBars = alt.Chart(penguins).mark_bar().encode(
        x=alt.X('species:N', title='펭귄 종'),
        y=alt.Y('mean(body_mass_g):Q', title='평균 체중 (g)'),
        color='species:N'
    )

    weightText = alt.Chart(penguins).mark_text(
        dy=-10,
        fontSize=12
    ).encode(
        x='species:N',
        y='mean(body_mass_g):Q',
        text='mean(body_mass_g):Q'
    )

    chartWeight = (weightBars + weightText).properties(
        title='펭귄 종별 평균 체중',
        width=300,
        height=250
    )
    chartWeight
  exercise:
    prompt: 7단계. 신체 특성 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      weightBars = alt.Chart(penguins).mark_bar().encode(
          x=alt.X('species:N', title='펭귄 종'),
          y=alt.Y('mean(body_mass_g):Q', title='평균 체중 (g)'),
          color='species:N'
      )

      weightText = alt.Chart(penguins).mark_text(
          dy=-10,
          fontSize=12
      ).encode(
          x='species:N',
          y='mean(body_mass_g):Q',
          text='mean(body_mass_g):Q'
      )

      chartWeight = (weightBars + weightText).properties(
          title='펭귄 종별 평균 체중',
          width=300,
          height=250
      )
      chartWeight
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 7단계. 신체 특성 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 신체 특성 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_final
  title: 8단계. 최종 결과물
  structuredPrimary: true
  subtitle: 펭귄 서식지 대시보드
  goal: 8단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    지금까지 배운 모든 개념을 종합해 펭귄 데이터를 시각화합니다. 섬별 펭귄 분포와 신체 특성을 함께 표현합니다.

    Gentoo 펭귄이 가장 크고 무겁습니다. 지느러미 길이와 체중 사이에 양의 상관관계가 있습니다. 점선은 각 종의 평균 체중을 나타냅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    dotFinal = alt.Chart(penguins).mark_circle(size=80, opacity=0.7).encode(
        x=alt.X('flipper_length_mm:Q', title='지느러미 길이 (mm)'),
        y=alt.Y('body_mass_g:Q', title='체중 (g)'),
        color=alt.Color('species:N', title='종'),
        shape=alt.Shape('island:N', title='서식지'),
        tooltip=['species', 'island', 'flipper_length_mm', 'body_mass_g', 'sex']
    )

    speciesMeanRule = alt.Chart(penguins).mark_rule(strokeDash=[4, 4], size=2).encode(
        y=alt.Y('mean(body_mass_g):Q', title='체중 (g)'),
        color=alt.Color('species:N', title='종')
    )

    dotFinal + speciesMeanRule
  exercise:
    prompt: 8단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      dotFinal = alt.Chart(penguins).mark_circle(size=80, opacity=0.7).encode(
          x=alt.X('flipper_length_mm:Q', title='지느러미 길이 (mm)'),
          y=alt.Y('body_mass_g:Q', title='체중 (g)'),
          color=alt.Color('species:N', title='종'),
          shape=alt.Shape('island:N', title='서식지'),
          tooltip=['species', 'island', 'flipper_length_mm', 'body_mass_g', 'sex']
      )

      speciesMeanRule = alt.Chart(penguins).mark_rule(strokeDash=[4, 4], size=2).encode(
          y=alt.Y('mean(body_mass_g):Q', title='체중 (g)'),
          color=alt.Color('species:N', title='종')
      )

      dotFinal + speciesMeanRule
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 8단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step9_workflow
  title: 9단계. 실무 레이어 차트 검증
  structuredPrimary: true
  subtitle: 예측 → 오류 확인 → 사양 검증 → 기준 실험
  goal: 9단계. 실무 레이어 차트 검증에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 조건 분기는 입력값에 따라 실행 경로가 바뀌므로 결과를 바로 확인해야 합니다.
  explanation: 실무에서는 차트가 화면에 보이는지만 확인하면 부족합니다. 어떤 종이 가장 무거울지 먼저 예측하고, 차트 사양에 레이어·축·툴팁·데이터 행 수가 제대로 들어갔는지
    코드로 검증해야 합니다. 이번 단계에서는 잘못 만든 차트를 일부러 검사에 실패시킨 뒤, 완성 차트가 요구 조건을 만족하는지 확인합니다. 마지막으로 평균 체중 기준을 바꿔 분석
    결과가 어떻게 달라지는지 실험합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    requiredColumns = {
        "species",
        "island",
        "flipper_length_mm",
        "body_mass_g",
        "sex",
    }
    missingColumns = requiredColumns - set(penguins.columns)
    if missingColumns:
        raise ValueError(f"펭귄 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")

    massBySpecies = (
        penguins.groupby("species")["body_mass_g"]
        .mean()
        .round(1)
        .sort_values(ascending=False)
    )
    heaviestSpecies = massBySpecies.index[0]
    speciesCount = penguins["species"].nunique()

    print("종별 평균 체중:", massBySpecies.to_dict())
    print("예상: 평균 체중이 가장 높은 종은", heaviestSpecies)
  exercise:
    prompt: 9단계. 실무 레이어 차트 검증 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.
    starterCode: |-
      requiredColumns = {
          "species",
          "island",
          "flipper_length_mm",
          "body_mass_g",
          "sex",
      }
      missingColumns = requiredColumns - set(penguins.columns)
      if missingColumns:
          raise ValueError(f"펭귄 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")

      massBySpecies = (
          penguins.groupby("species")["body_mass_g"]
          .mean()
          .round(1)
          .sort_values(ascending=False)
      )
      heaviestSpecies = massBySpecies.index[0]
      speciesCount = penguins["species"].nunique()

      print("종별 평균 체중:", massBySpecies.to_dict())
      print("예상: 평균 체중이 가장 높은 종은", heaviestSpecies)
    hints:
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.
  check:
    noError: 9단계. 실무 레이어 차트 검증의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.
    resultCheck: 9단계. 실무 레이어 차트 검증 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 펭귄 데이터 레이어 프로젝트
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    이 프로젝트에서 배운 내용을 정리합니다. mark_area()로 영역 차트를, mark_rule()로 선을, mark_text()로 텍스트를 그렸습니다. + 연산자로 여러 차트를 레이어로 겹쳤습니다. 두 차트를 더하면 하나로 합쳐집니다. opacity로 투명도를, dy로 텍스트 위치를, strokeDash로 점선을 설정했습니다. 각 미션에서 이 개념들을 활용해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import altair as alt
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset
    bird = loadLocalDataset("penguins")
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset
      bird = loadLocalDataset("penguins")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: Altair로 영역 차트와 레이어를 마스터했습니다!
  - type: list
    items:
    - mark_area() - 영역 차트 마크
    - mark_area(opacity) - 투명도 조절
    - mark_rule() - 수평선/수직선
    - mark_text(dy, fontSize) - 텍스트 레이블
    - chart1 + chart2 - 레이어 결합
    - 스택 영역 차트 - color로 자동 스택
  - type: text
    content: 다음 프로젝트에서는 타이타닉 데이터로 facet과 필터를 배웁니다.
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.
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
  - id: altair_04-penguin-facet-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - summary
    title: 펭귄 서식지 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: species와 island를 color 하나에 과적재하지 않는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_penguin_facet(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_penguin_facet(rows):
            raise NotImplementedError
      solution: |
        def prepare_penguin_facet(rows):
            required = ['billLength', 'bodyMass', 'species']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'species'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['billLength'] for row in usable]
            y_values = [row['bodyMass'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.altair.altair_04.penguin-facet-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_04.penguin-facet-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_penguin_facet
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - billLength: 40
              bodyMass: 3200
              species: A
            - billLength: 45
              bodyMass: 4000
              species: B
            - billLength: null
              bodyMass: 4100
              species: B
          expectedReturn:
            usableCount: 2
            excludedCount: 1
            groupCounts:
              A: 1
              B: 1
            xExtent:
            - 40
            - 45
            yExtent:
            - 3200
            - 4000
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
  - id: altair_04-penguin-facet-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - altair_04-penguin-facet-data-evidence-mastery
    title: 펭귄 서식지 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 장비 유형은 color, 운영 지역은 facet으로 분리해 두 측정값을 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_penguin_facet(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_penguin_facet(candidate):
            raise NotImplementedError
      solution: |
        def audit_penguin_facet(candidate):
            expected = {'mark': 'point', 'x': 'billLength', 'y': 'bodyMass', 'group': 'species', 'transforms': ['facet-island'], 'interaction': 'none'}
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
      id: python.altair.altair_04.penguin-facet-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_04.penguin-facet-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_penguin_facet
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: point
              x: billLength
              y: bodyMass
              group: species
              transforms:
              - facet-island
              interaction: none
              description: 장비 유형은 color, 운영 지역은 facet으로 분리해 두 측정값을 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: point
              x: billLength
              y: bodyMass
              group: species
              transforms:
              - facet-island
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: bodyMass
              y: billLength
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
              mark: point
              x: billLength
              y: bodyMass
              group: species
              transforms:
              - facet-island
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: altair_04-penguin-facet-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - altair_04-penguin-facet-encoding-transfer-transfer
    title: 펭귄 서식지 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: species와 island를 color 하나에 과적재하지 않는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_penguin_facet(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_penguin_facet(situation):
            raise NotImplementedError
      solution: |
        def choose_penguin_facet(situation):
            table = {'two-categories': {'encoding': 'color plus facet', 'evidence': 'group counts', 'risk': 'combinatorial legend'}, 'shared-comparison': {'encoding': 'fixed facet scales', 'evidence': 'common domains', 'risk': 'free scales'}, 'tiny-facet': {'encoding': 'points plus n', 'evidence': 'facet sample size', 'risk': 'empty pattern'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.altair.altair_04.penguin-facet-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_04.penguin-facet-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_penguin_facet
        cases:
        - id: recalls-two-categories
          arguments:
          - value: two-categories
          expectedReturn:
            encoding: color plus facet
            evidence: group counts
            risk: combinatorial legend
        - id: recalls-shared-comparison
          arguments:
          - value: shared-comparison
          expectedReturn:
            encoding: fixed facet scales
            evidence: common domains
            risk: free scales
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};