var e=`meta:
  packages:
  - altair
  - pandas
  id: altair_02
  title: 붓꽃품종구분
  order: 2
  category: altair
  difficulty: ⭐
  badge: 입문
  tags:
  - mark_point
  - mark_circle
  - color
  - size
  - shape
  - encoding
  seo:
    title: Altair 붓꽃 품종 구분 - 산점도와 인코딩
    description: Altair로 붓꽃 데이터를 시각화합니다. 색상, 크기, 모양 인코딩으로 품종을 구분하는 방법을 배웁니다.
    keywords:
    - altair scatter
    - color encoding
    - size encoding
    - shape encoding
    - mark_circle
intro:
  emoji: 🌸
  goal: 붓꽃 3품종(setosa, versicolor, virginica)의 특성을 다양한 인코딩으로 비교하는 차트를 만듭니다.
  description: 이전 프로젝트에서 배운 mark_point, x/y, color를 복습하고, 새로운 size, shape, mark_circle 인코딩을 추가합니다.
  direction: 붓꽃품종구분에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.
  benefits:
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.
  - 붓꽃품종구분 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 불러오기 입력 확인
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 산점도 처리 실행
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 색상으로 품종 구분 결과 검증
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.
    - label: 붓꽃품종구분 재사용
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.
    runtime:
    - label: 선언형 차트 환경
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 붓꽃품종구분 실행
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.
    - label: 붓꽃품종구분 완료
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: seaborn-data
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: Codaro 로컬 데이터셋에서 iris 데이터를 불러옵니다. 붓꽃 3품종(setosa, versicolor, virginica) 각 50송이, 총 150송이의
    측정 데이터입니다. 각 행은 꽃잎(petal)과 꽃받침(sepal)의 길이/너비 측정값을 담고 있습니다. species 컬럼이 품종을 나타냅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import altair as alt
    import pandas as pd
    import warnings
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')
    from codaro.curriculum.localData import loadLocalDataset

    iris = loadLocalDataset("iris")
  exercise:
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      import pandas as pd
      import warnings
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')
      from codaro.curriculum.localData import loadLocalDataset

      iris = loadLocalDataset("iris")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_basic_scatter
  title: 2단계. 기본 산점도
  structuredPrimary: true
  subtitle: 꽃잎 길이 vs 너비
  goal: 2단계. 기본 산점도에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 이전 프로젝트에서 배운 mark_point()와 encode(x, y)를 활용합니다. 같은 패턴을 다른 데이터에 적용하면서 복습합니다. 꽃잎 길이(petal_length)와
    꽃잎 너비(petal_width)의 관계를 산점도로 그립니다. x축에 길이, y축에 너비를 배치하여 두 변수의 관계를 시각적으로 확인합니다. chartBasic이라는 변수에 차트를
    저장하고, 마지막 줄에서 변수명을 쓰면 차트가 화면에 표시됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    chartBasic = alt.Chart(iris).mark_point().encode(
        x="petal_length:Q",
        y="petal_width:Q"
    )
    chartBasic
  exercise:
    prompt: 2단계. 기본 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartBasic = alt.Chart(iris).mark_point().encode(
          x="petal_length:Q",
          y="petal_width:Q"
      )
      chartBasic
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 2단계. 기본 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 2단계. 기본 산점도의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step3_color_encoding
  title: 3단계. 색상으로 품종 구분
  structuredPrimary: true
  subtitle: color 인코딩
  goal: 3단계. 색상으로 품종 구분에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    color 인코딩으로 품종(species)을 색상으로 구분합니다. 이전 프로젝트에서도 사용한 개념입니다. 품종별로 데이터가 어떻게 분포하는지 한눈에 파악할 수 있습니다.

    color="species:N"에서 :N은 명목형(Nominal) 데이터 타입입니다. 범주형 데이터에 사용하며, Altair가 자동으로 구분되는 색상을 할당합니다.
  snippet: |-
    chartColor = alt.Chart(iris).mark_point().encode(
        x="petal_length:Q",
        y="petal_width:Q",
        color="species:N"
    )
    chartColor
  exercise:
    prompt: 3단계. 색상으로 품종 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartColor = alt.Chart(iris).mark_point().encode(
          x="petal_length:Q",
          y="petal_width:Q",
          color="species:N"
      )
      chartColor
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 3단계. 색상으로 품종 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 색상으로 품종 구분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step4_size_encoding
  title: 4단계. 크기 인코딩
  structuredPrimary: true
  subtitle: size로 추가 정보
  goal: 4단계. 크기 인코딩에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    size 인코딩으로 점의 크기에 또 다른 변수를 매핑합니다. encode() 괄호 안에 size를 추가하면 됩니다. 꽃받침 길이(sepal_length)를 크기로 표현하면, x(꽃잎 길이), y(꽃잎 너비), color(품종), size(꽃받침 길이) 총 4개의 변수를 한 차트에 표현할 수 있습니다. 값이 클수록 점이 커지므로, 꽃받침이 긴 품종이 어느 것인지 쉽게 파악할 수 있습니다.

    size="sepal_length:Q"에서 :Q는 수량형(Quantitative) 데이터입니다. 연속적인 수치 데이터에 사용하며, 값이 클수록 점이 커집니다.
  snippet: |-
    chartSize = alt.Chart(iris).mark_point().encode(
        x="petal_length:Q",
        y="petal_width:Q",
        color="species:N",
        size="sepal_length:Q"
    )
    chartSize
  exercise:
    prompt: 4단계. 크기 인코딩 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartSize = alt.Chart(iris).mark_point().encode(
          x="petal_length:Q",
          y="petal_width:Q",
          color="species:N",
          size="sepal_length:Q"
      )
      chartSize
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 4단계. 크기 인코딩의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 4단계. 크기 인코딩의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step5_shape_encoding
  title: 5단계. 모양 인코딩
  structuredPrimary: true
  subtitle: shape로 품종 구분
  goal: 5단계. 모양 인코딩에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    shape 인코딩으로 점의 모양을 변경할 수 있습니다. color처럼 encode() 괄호 안에 shape를 추가합니다. 색상 대신 모양으로 품종을 구분하면, 흑백 인쇄에서도 구분이 가능합니다. Altair는 자동으로 원, 사각형, 삼각형 등 서로 다른 모양을 할당합니다. 색상과 모양을 함께 사용하면 더 명확해집니다. 같은 컬럼을 color와 shape 둘 다에 지정할 수 있습니다.

    shape 인코딩은 명목형(:N) 데이터에만 사용할 수 있습니다. 원, 사각형, 삼각형 등 최대 8개 모양을 지원합니다.
  snippet: |-
    chartShape = alt.Chart(iris).mark_point().encode(
        x="petal_length:Q",
        y="petal_width:Q",
        color="species:N",
        shape="species:N"
    )
    chartShape
  exercise:
    prompt: 5단계. 모양 인코딩 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartShape = alt.Chart(iris).mark_point().encode(
          x="petal_length:Q",
          y="petal_width:Q",
          color="species:N",
          shape="species:N"
      )
      chartShape
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 5단계. 모양 인코딩의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 5단계. 모양 인코딩의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step6_mark_circle
  title: 6단계. 마크 스타일링
  structuredPrimary: true
  subtitle: mark_circle(size, opacity)
  goal: 6단계. 마크 스타일링에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    mark_point() 대신 mark_circle()을 사용하면 채워진 원으로 표시됩니다. 둘 다 점을 그리지만, circle이 더 명확하게 보입니다. 마크 함수 괄호 안에 직접 size, opacity 파라미터를 전달할 수 있습니다. 파라미터는 함수에 전달하는 설정값입니다. size=100은 모든 점의 크기를 100으로 고정합니다. opacity=0.7은 투명도를 70%로 설정합니다(0은 완전 투명, 1은 완전 불투명). 이것은 encode(size=...)와 다릅니다. encode()는 데이터에 따라 크기가 달라지지만, mark_circle(size=100)은 모든 점이 같은 크기입니다.

    괄호 안에서 쉼표(,)로 여러 파라미터를 나열할 수 있습니다. size=100, opacity=0.7처럼 쓰면 크기와 투명도를 동시에 설정합니다. 파라미터 이름(size, opacity)과 값(100, 0.7)을 등호(=)로 연결하는 것을 "키워드 인자"라고 합니다.
  tips:
  - 괄호 안에서 쉼표(,)로 여러 파라미터를 나열할 수 있습니다. size=100, opacity=0.7처럼 쓰면 크기와 투명도를 동시에 설정합니다. 파라미터 이름(size, opacity)과
    값(100, 0.7)을 등호(=)로 연결하는 것을 "키워드 인자"라고 합니다.
  snippet: |-
    chartCircle = alt.Chart(iris).mark_circle(
        size=100,
        opacity=0.7
    ).encode(
        x="petal_length:Q",
        y="petal_width:Q",
        color="species:N"
    )
    chartCircle
  exercise:
    prompt: 6단계. 마크 스타일링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartCircle = alt.Chart(iris).mark_circle(
          size=100,
          opacity=0.7
      ).encode(
          x="petal_length:Q",
          y="petal_width:Q",
          color="species:N"
      )
      chartCircle
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 6단계. 마크 스타일링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. 마크 스타일링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_sepal_analysis
  title: 7단계. 꽃받침 특성 분석
  structuredPrimary: true
  subtitle: 다른 변수 조합
  goal: 7단계. 꽃받침 특성 분석에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 꽃받침(sepal) 특성으로도 품종을 구분할 수 있는지 확인합니다. x, y를 꽃받침 변수로 바꾸고, 지금까지 배운 인코딩을 모두 적용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    chartSepal = alt.Chart(iris).mark_circle(
        opacity=0.8
    ).encode(
        x="sepal_length:Q",
        y="sepal_width:Q",
        color="species:N",
        size="petal_length:Q",
        shape="species:N"
    )
    chartSepal
  exercise:
    prompt: 7단계. 꽃받침 특성 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartSepal = alt.Chart(iris).mark_circle(
          opacity=0.8
      ).encode(
          x="sepal_length:Q",
          y="sepal_width:Q",
          color="species:N",
          size="petal_length:Q",
          shape="species:N"
      )
      chartSepal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 7단계. 꽃받침 특성 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 꽃받침 특성 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_final
  title: 8단계. 최종 결과물
  structuredPrimary: true
  subtitle: 품종별 특성 비교 차트
  goal: 8단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    지금까지 배운 모든 개념을 종합해 최종 차트를 완성합니다. 여기서는 alt.X(), alt.Y(), alt.Color() 같은 방식을 사용합니다. 이렇게 하면 title 파라미터로 축 제목을 한글로 바꿀 수 있습니다. properties()는 차트 전체의 속성을 설정하는 함수입니다. title로 차트 제목을, width와 height로 크기를 지정합니다. setosa는 왼쪽 아래, virginica는 오른쪽 위에 명확히 분리되어 품종 간 차이가 뚜렷하게 보입니다.

    alt.X("petal_length:Q", title="꽃잎 길이 (cm)")에서 첫 번째 인자는 데이터 컬럼과 타입, 두 번째 인자(title=)는 축에 표시될 제목입니다. properties() 뒤에도 점(.)을 연결할 수 없습니다. properties()는 메서드 체이닝의 마지막에 위치합니다.
  tips:
  - alt.X("petal_length:Q", title="꽃잎 길이 (cm)")에서 첫 번째 인자는 데이터 컬럼과 타입, 두 번째 인자(title=)는 축에 표시될 제목입니다.
    properties() 뒤에도 점(.)을 연결할 수 없습니다. properties()는 메서드 체이닝의 마지막에 위치합니다.
  snippet: |-
    chartFinal = alt.Chart(iris).mark_circle(opacity=0.8).encode(
        x=alt.X("petal_length:Q", title="꽃잎 길이 (cm)"),
        y=alt.Y("petal_width:Q", title="꽃잎 너비 (cm)"),
        color=alt.Color("species:N", title="품종"),
        size=alt.Size("sepal_length:Q", title="꽃받침 길이"),
        shape=alt.Shape("species:N", title="품종")
    ).properties(title="붓꽃 품종별 특성 비교", width=500, height=400)
    chartFinal
  exercise:
    prompt: 8단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartFinal = alt.Chart(iris).mark_circle(opacity=0.8).encode(
          x=alt.X("petal_length:Q", title="꽃잎 길이 (cm)"),
          y=alt.Y("petal_width:Q", title="꽃잎 너비 (cm)"),
          color=alt.Color("species:N", title="품종"),
          size=alt.Size("sepal_length:Q", title="꽃받침 길이"),
          shape=alt.Shape("species:N", title="품종")
      ).properties(title="붓꽃 품종별 특성 비교", width=500, height=400)
      chartFinal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 8단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: workflow_validation
  title: 9단계. 차트 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 오류 수정 → spec 검증
  goal: 9단계. 차트 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    Altair 차트는 화면에 보이는 그림이면서 동시에 JSON spec입니다. 그래서 완성된 차트가 품종을 색상과 모양으로 구분하는지, 제목과 축 인코딩이 들어갔는지 코드로 검증할 수 있습니다. 먼저 setosa는 꽃잎 길이에서 다른 품종과 분리될 것이라고 예측합니다. 그런 다음 데이터 요약과 차트 spec을 함께 확인해, 보고서에 넣기 전에 차트가 의도대로 만들어졌는지 검사합니다.

    Altair는 차트를 spec으로 표현하기 때문에 화면을 눈으로 확인하지 않아도 인코딩 누락을 테스트할 수 있습니다. 시각화 자동화와 보고서 생성에서 특히 유용한 습관입니다.
  snippet: |-
    requiredColumns = {"sepal_length", "sepal_width", "petal_length", "petal_width", "species"}
    missingColumns = requiredColumns - set(iris.columns)
    speciesCounts = iris["species"].value_counts().to_dict()

    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
    assert iris.shape == (150, 5)
    assert speciesCounts == {"setosa": 50, "versicolor": 50, "virginica": 50}

    setosaMaxPetalLength = iris.loc[iris["species"] == "setosa", "petal_length"].max()
    nonSetosaMinPetalLength = iris.loc[iris["species"] != "setosa", "petal_length"].min()

    assert setosaMaxPetalLength < nonSetosaMinPetalLength
    iris.groupby("species")[["petal_length", "petal_width"]].mean().round(2)
  exercise:
    prompt: 9단계. 차트 검증 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      requiredColumns = {"sepal_length", "sepal_width", "petal_length", "petal_width", "species"}
      missingColumns = requiredColumns - set(iris.columns)
      speciesCounts = iris["species"].value_counts().to_dict()

      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
      assert iris.shape == (150, 5)
      assert speciesCounts == {"setosa": 50, "versicolor": 50, "virginica": 50}

      setosaMaxPetalLength = iris.loc[iris["species"] == "setosa", "petal_length"].max()
      nonSetosaMinPetalLength = iris.loc[iris["species"] != "setosa", "petal_length"].min()

      assert setosaMaxPetalLength < nonSetosaMinPetalLength
      iris.groupby("species")[["petal_length", "petal_width"]].mean().round(2)
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 9단계. 차트 검증 루프에서 \`requiredColumns\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 9단계. 차트 검증 루프에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 붓꽃 인코딩 프로젝트
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    배운 내용을 정리하면, 이 프로젝트에서는 mark_point와 mark_circle로 점을 그렸습니다. mark_circle은 채워진 원을 그립니다. encode()에서 color로 색상, size로 크기, shape로 모양을 지정했습니다. 여러 인코딩을 조합하면 한 차트에 많은 정보를 담을 수 있습니다. alt.X(), alt.Color() 등으로 축 제목을 설정하고, properties()로 차트 크기를 조절했습니다. 각 미션에서 이 개념들을 활용해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import altair as alt
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset
    flower = loadLocalDataset("iris")
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset
      flower = loadLocalDataset("iris")
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
    content: Altair로 붓꽃 품종을 시각적으로 구분하는 방법을 배웠습니다!
  - type: list
    items:
    - mark_point() - 점 마크 (이전 프로젝트 복습)
    - mark_circle(size, opacity) - 채워진 원 마크, 스타일 고정값 지정
    - x, y 인코딩 - 위치 매핑 (복습)
    - color 인코딩 - 색상으로 범주 구분 (복습)
    - size 인코딩 - 크기로 수치 표현 (새로 배움)
    - shape 인코딩 - 모양으로 범주 구분 (새로 배움)
    - :Q, :N 타입 - 수량형/명목형 데이터 타입
  - type: text
    content: 다음 프로젝트에서는 팁 데이터로 막대 차트와 집계 함수를 배웁니다.
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
  - id: altair_02-iris-type-separation-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - summary
    title: 붓꽃 품종 구분 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 품종 nominal encoding과 수치 scale이 schema에 맞는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_iris_type_separation(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_iris_type_separation(rows):
            raise NotImplementedError
      solution: |
        def prepare_iris_type_separation(rows):
            required = ['sepalLength', 'petalWidth', 'species']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'species'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['sepalLength'] for row in usable]
            y_values = [row['petalWidth'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.altair.altair_02.iris-type-separation-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_02.iris-type-separation-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_iris_type_separation
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - sepalLength: 5.0
              petalWidth: 0.2
              species: setosa
            - sepalLength: 6.0
              petalWidth: 1.5
              species: versicolor
            - sepalLength: 6.5
              petalWidth: 2.0
              species: virginica
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              setosa: 1
              versicolor: 1
              virginica: 1
            xExtent:
            - 5.0
            - 6.5
            yExtent:
            - 0.2
            - 2.0
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
  - id: altair_02-iris-type-separation-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - altair_02-iris-type-separation-data-evidence-mastery
    title: 붓꽃 품종 구분 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 세 제품 유형을 두 품질 지표와 legend filter로 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_iris_type_separation(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_iris_type_separation(candidate):
            raise NotImplementedError
      solution: |
        def audit_iris_type_separation(candidate):
            expected = {'mark': 'point', 'x': 'sepalLength', 'y': 'petalWidth', 'group': 'species', 'transforms': ['type-declarations'], 'interaction': 'legend-filter'}
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
      id: python.altair.altair_02.iris-type-separation-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_02.iris-type-separation-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_iris_type_separation
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: point
              x: sepalLength
              y: petalWidth
              group: species
              transforms:
              - type-declarations
              interaction: legend-filter
              description: 세 제품 유형을 두 품질 지표와 legend filter로 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: point
              x: sepalLength
              y: petalWidth
              group: species
              transforms:
              - type-declarations
              interaction: legend-filter
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: petalWidth
              y: sepalLength
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
            - interaction
            - description
            encoding:
              mark: point
              x: sepalLength
              y: petalWidth
              group: species
              transforms:
              - type-declarations
              interaction: legend-filter
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: altair_02-iris-type-separation-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - altair_02-iris-type-separation-encoding-transfer-transfer
    title: 붓꽃 품종 구분 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 품종 nominal encoding과 수치 scale이 schema에 맞는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_iris_type_separation(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_iris_type_separation(situation):
            raise NotImplementedError
      solution: |
        def choose_iris_type_separation(situation):
            table = {'species-field': {'encoding': 'nominal color', 'evidence': 'domain values', 'risk': 'implicit type'}, 'measurement-field': {'encoding': 'quantitative axis', 'evidence': 'units', 'risk': 'zero baseline assumption'}, 'legend-selection': {'encoding': 'parameter filter', 'evidence': 'visible active values', 'risk': 'hidden exclusion'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.altair.altair_02.iris-type-separation-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_02.iris-type-separation-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_iris_type_separation
        cases:
        - id: recalls-species-field
          arguments:
          - value: species-field
          expectedReturn:
            encoding: nominal color
            evidence: domain values
            risk: implicit type
        - id: recalls-measurement-field
          arguments:
          - value: measurement-field
          expectedReturn:
            encoding: quantitative axis
            evidence: units
            risk: zero baseline assumption
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};