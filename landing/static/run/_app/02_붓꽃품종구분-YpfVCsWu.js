var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_02\r
  title: 붓꽃품종구분\r
  order: 2\r
  category: altair\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - mark_point\r
  - mark_circle\r
  - color\r
  - size\r
  - shape\r
  - encoding\r
  seo:\r
    title: Altair 붓꽃 품종 구분 - 산점도와 인코딩\r
    description: Altair로 붓꽃 데이터를 시각화합니다. 색상, 크기, 모양 인코딩으로 품종을 구분하는 방법을 배웁니다.\r
    keywords:\r
    - altair scatter\r
    - color encoding\r
    - size encoding\r
    - shape encoding\r
    - mark_circle\r
intro:\r
  emoji: 🌸\r
  goal: 붓꽃 3품종(setosa, versicolor, virginica)의 특성을 다양한 인코딩으로 비교하는 차트를 만듭니다.\r
  description: 이전 프로젝트에서 배운 mark_point, x/y, color를 복습하고, 새로운 size, shape, mark_circle 인코딩을 추가합니다.\r
  direction: 붓꽃품종구분에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 붓꽃품종구분 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 산점도 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 색상으로 품종 구분 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 붓꽃품종구분 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 붓꽃품종구분 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 붓꽃품종구분 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 iris 데이터를 불러옵니다. 붓꽃 3품종(setosa, versicolor, virginica) 각 50송이, 총 150송이의\r
    측정 데이터입니다. 각 행은 꽃잎(petal)과 꽃받침(sepal)의 길이/너비 측정값을 담고 있습니다. species 컬럼이 품종을 나타냅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    import warnings\r
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    iris = loadLocalDataset("iris")\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      import warnings\r
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      iris = loadLocalDataset("iris")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_basic_scatter\r
  title: 2단계. 기본 산점도\r
  structuredPrimary: true\r
  subtitle: 꽃잎 길이 vs 너비\r
  goal: 2단계. 기본 산점도에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 이전 프로젝트에서 배운 mark_point()와 encode(x, y)를 활용합니다. 같은 패턴을 다른 데이터에 적용하면서 복습합니다. 꽃잎 길이(petal_length)와\r
    꽃잎 너비(petal_width)의 관계를 산점도로 그립니다. x축에 길이, y축에 너비를 배치하여 두 변수의 관계를 시각적으로 확인합니다. chartBasic이라는 변수에 차트를\r
    저장하고, 마지막 줄에서 변수명을 쓰면 차트가 화면에 표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartBasic = alt.Chart(iris).mark_point().encode(\r
        x="petal_length:Q",\r
        y="petal_width:Q"\r
    )\r
    chartBasic\r
  exercise:\r
    prompt: 2단계. 기본 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartBasic = alt.Chart(iris).mark_point().encode(\r
          x="petal_length:Q",\r
          y="petal_width:Q"\r
      )\r
      chartBasic\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 기본 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 산점도의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_color_encoding\r
  title: 3단계. 색상으로 품종 구분\r
  structuredPrimary: true\r
  subtitle: color 인코딩\r
  goal: 3단계. 색상으로 품종 구분에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    color 인코딩으로 품종(species)을 색상으로 구분합니다. 이전 프로젝트에서도 사용한 개념입니다. 품종별로 데이터가 어떻게 분포하는지 한눈에 파악할 수 있습니다.\r
\r
    color="species:N"에서 :N은 명목형(Nominal) 데이터 타입입니다. 범주형 데이터에 사용하며, Altair가 자동으로 구분되는 색상을 할당합니다.\r
  snippet: |-\r
    chartColor = alt.Chart(iris).mark_point().encode(\r
        x="petal_length:Q",\r
        y="petal_width:Q",\r
        color="species:N"\r
    )\r
    chartColor\r
  exercise:\r
    prompt: 3단계. 색상으로 품종 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartColor = alt.Chart(iris).mark_point().encode(\r
          x="petal_length:Q",\r
          y="petal_width:Q",\r
          color="species:N"\r
      )\r
      chartColor\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 색상으로 품종 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 색상으로 품종 구분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_size_encoding\r
  title: 4단계. 크기 인코딩\r
  structuredPrimary: true\r
  subtitle: size로 추가 정보\r
  goal: 4단계. 크기 인코딩에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    size 인코딩으로 점의 크기에 또 다른 변수를 매핑합니다. encode() 괄호 안에 size를 추가하면 됩니다. 꽃받침 길이(sepal_length)를 크기로 표현하면, x(꽃잎 길이), y(꽃잎 너비), color(품종), size(꽃받침 길이) 총 4개의 변수를 한 차트에 표현할 수 있습니다. 값이 클수록 점이 커지므로, 꽃받침이 긴 품종이 어느 것인지 쉽게 파악할 수 있습니다.\r
\r
    size="sepal_length:Q"에서 :Q는 수량형(Quantitative) 데이터입니다. 연속적인 수치 데이터에 사용하며, 값이 클수록 점이 커집니다.\r
  snippet: |-\r
    chartSize = alt.Chart(iris).mark_point().encode(\r
        x="petal_length:Q",\r
        y="petal_width:Q",\r
        color="species:N",\r
        size="sepal_length:Q"\r
    )\r
    chartSize\r
  exercise:\r
    prompt: 4단계. 크기 인코딩 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartSize = alt.Chart(iris).mark_point().encode(\r
          x="petal_length:Q",\r
          y="petal_width:Q",\r
          color="species:N",\r
          size="sepal_length:Q"\r
      )\r
      chartSize\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 크기 인코딩의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 크기 인코딩의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_shape_encoding\r
  title: 5단계. 모양 인코딩\r
  structuredPrimary: true\r
  subtitle: shape로 품종 구분\r
  goal: 5단계. 모양 인코딩에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    shape 인코딩으로 점의 모양을 변경할 수 있습니다. color처럼 encode() 괄호 안에 shape를 추가합니다. 색상 대신 모양으로 품종을 구분하면, 흑백 인쇄에서도 구분이 가능합니다. Altair는 자동으로 원, 사각형, 삼각형 등 서로 다른 모양을 할당합니다. 색상과 모양을 함께 사용하면 더 명확해집니다. 같은 컬럼을 color와 shape 둘 다에 지정할 수 있습니다.\r
\r
    shape 인코딩은 명목형(:N) 데이터에만 사용할 수 있습니다. 원, 사각형, 삼각형 등 최대 8개 모양을 지원합니다.\r
  snippet: |-\r
    chartShape = alt.Chart(iris).mark_point().encode(\r
        x="petal_length:Q",\r
        y="petal_width:Q",\r
        color="species:N",\r
        shape="species:N"\r
    )\r
    chartShape\r
  exercise:\r
    prompt: 5단계. 모양 인코딩 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartShape = alt.Chart(iris).mark_point().encode(\r
          x="petal_length:Q",\r
          y="petal_width:Q",\r
          color="species:N",\r
          shape="species:N"\r
      )\r
      chartShape\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 모양 인코딩의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 모양 인코딩의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_mark_circle\r
  title: 6단계. 마크 스타일링\r
  structuredPrimary: true\r
  subtitle: mark_circle(size, opacity)\r
  goal: 6단계. 마크 스타일링에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    mark_point() 대신 mark_circle()을 사용하면 채워진 원으로 표시됩니다. 둘 다 점을 그리지만, circle이 더 명확하게 보입니다. 마크 함수 괄호 안에 직접 size, opacity 파라미터를 전달할 수 있습니다. 파라미터는 함수에 전달하는 설정값입니다. size=100은 모든 점의 크기를 100으로 고정합니다. opacity=0.7은 투명도를 70%로 설정합니다(0은 완전 투명, 1은 완전 불투명). 이것은 encode(size=...)와 다릅니다. encode()는 데이터에 따라 크기가 달라지지만, mark_circle(size=100)은 모든 점이 같은 크기입니다.\r
\r
    괄호 안에서 쉼표(,)로 여러 파라미터를 나열할 수 있습니다. size=100, opacity=0.7처럼 쓰면 크기와 투명도를 동시에 설정합니다. 파라미터 이름(size, opacity)과 값(100, 0.7)을 등호(=)로 연결하는 것을 "키워드 인자"라고 합니다.\r
  tips:\r
  - 괄호 안에서 쉼표(,)로 여러 파라미터를 나열할 수 있습니다. size=100, opacity=0.7처럼 쓰면 크기와 투명도를 동시에 설정합니다. 파라미터 이름(size, opacity)과\r
    값(100, 0.7)을 등호(=)로 연결하는 것을 "키워드 인자"라고 합니다.\r
  snippet: |-\r
    chartCircle = alt.Chart(iris).mark_circle(\r
        size=100,\r
        opacity=0.7\r
    ).encode(\r
        x="petal_length:Q",\r
        y="petal_width:Q",\r
        color="species:N"\r
    )\r
    chartCircle\r
  exercise:\r
    prompt: 6단계. 마크 스타일링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartCircle = alt.Chart(iris).mark_circle(\r
          size=100,\r
          opacity=0.7\r
      ).encode(\r
          x="petal_length:Q",\r
          y="petal_width:Q",\r
          color="species:N"\r
      )\r
      chartCircle\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 마크 스타일링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 마크 스타일링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_sepal_analysis\r
  title: 7단계. 꽃받침 특성 분석\r
  structuredPrimary: true\r
  subtitle: 다른 변수 조합\r
  goal: 7단계. 꽃받침 특성 분석에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 꽃받침(sepal) 특성으로도 품종을 구분할 수 있는지 확인합니다. x, y를 꽃받침 변수로 바꾸고, 지금까지 배운 인코딩을 모두 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartSepal = alt.Chart(iris).mark_circle(\r
        opacity=0.8\r
    ).encode(\r
        x="sepal_length:Q",\r
        y="sepal_width:Q",\r
        color="species:N",\r
        size="petal_length:Q",\r
        shape="species:N"\r
    )\r
    chartSepal\r
  exercise:\r
    prompt: 7단계. 꽃받침 특성 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartSepal = alt.Chart(iris).mark_circle(\r
          opacity=0.8\r
      ).encode(\r
          x="sepal_length:Q",\r
          y="sepal_width:Q",\r
          color="species:N",\r
          size="petal_length:Q",\r
          shape="species:N"\r
      )\r
      chartSepal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 꽃받침 특성 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 꽃받침 특성 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_final\r
  title: 8단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 품종별 특성 비교 차트\r
  goal: 8단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 모든 개념을 종합해 최종 차트를 완성합니다. 여기서는 alt.X(), alt.Y(), alt.Color() 같은 방식을 사용합니다. 이렇게 하면 title 파라미터로 축 제목을 한글로 바꿀 수 있습니다. properties()는 차트 전체의 속성을 설정하는 함수입니다. title로 차트 제목을, width와 height로 크기를 지정합니다. setosa는 왼쪽 아래, virginica는 오른쪽 위에 명확히 분리되어 품종 간 차이가 뚜렷하게 보입니다.\r
\r
    alt.X("petal_length:Q", title="꽃잎 길이 (cm)")에서 첫 번째 인자는 데이터 컬럼과 타입, 두 번째 인자(title=)는 축에 표시될 제목입니다. properties() 뒤에도 점(.)을 연결할 수 없습니다. properties()는 메서드 체이닝의 마지막에 위치합니다.\r
  tips:\r
  - alt.X("petal_length:Q", title="꽃잎 길이 (cm)")에서 첫 번째 인자는 데이터 컬럼과 타입, 두 번째 인자(title=)는 축에 표시될 제목입니다.\r
    properties() 뒤에도 점(.)을 연결할 수 없습니다. properties()는 메서드 체이닝의 마지막에 위치합니다.\r
  snippet: |-\r
    chartFinal = alt.Chart(iris).mark_circle(opacity=0.8).encode(\r
        x=alt.X("petal_length:Q", title="꽃잎 길이 (cm)"),\r
        y=alt.Y("petal_width:Q", title="꽃잎 너비 (cm)"),\r
        color=alt.Color("species:N", title="품종"),\r
        size=alt.Size("sepal_length:Q", title="꽃받침 길이"),\r
        shape=alt.Shape("species:N", title="품종")\r
    ).properties(title="붓꽃 품종별 특성 비교", width=500, height=400)\r
    chartFinal\r
  exercise:\r
    prompt: 8단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFinal = alt.Chart(iris).mark_circle(opacity=0.8).encode(\r
          x=alt.X("petal_length:Q", title="꽃잎 길이 (cm)"),\r
          y=alt.Y("petal_width:Q", title="꽃잎 너비 (cm)"),\r
          color=alt.Color("species:N", title="품종"),\r
          size=alt.Size("sepal_length:Q", title="꽃받침 길이"),\r
          shape=alt.Shape("species:N", title="품종")\r
      ).properties(title="붓꽃 품종별 특성 비교", width=500, height=400)\r
      chartFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 9단계. 차트 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → spec 검증\r
  goal: 9단계. 차트 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Altair 차트는 화면에 보이는 그림이면서 동시에 JSON spec입니다. 그래서 완성된 차트가 품종을 색상과 모양으로 구분하는지, 제목과 축 인코딩이 들어갔는지 코드로 검증할 수 있습니다. 먼저 setosa는 꽃잎 길이에서 다른 품종과 분리될 것이라고 예측합니다. 그런 다음 데이터 요약과 차트 spec을 함께 확인해, 보고서에 넣기 전에 차트가 의도대로 만들어졌는지 검사합니다.\r
\r
    Altair는 차트를 spec으로 표현하기 때문에 화면을 눈으로 확인하지 않아도 인코딩 누락을 테스트할 수 있습니다. 시각화 자동화와 보고서 생성에서 특히 유용한 습관입니다.\r
  snippet: |-\r
    requiredColumns = {"sepal_length", "sepal_width", "petal_length", "petal_width", "species"}\r
    missingColumns = requiredColumns - set(iris.columns)\r
    speciesCounts = iris["species"].value_counts().to_dict()\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert iris.shape == (150, 5)\r
    assert speciesCounts == {"setosa": 50, "versicolor": 50, "virginica": 50}\r
\r
    setosaMaxPetalLength = iris.loc[iris["species"] == "setosa", "petal_length"].max()\r
    nonSetosaMinPetalLength = iris.loc[iris["species"] != "setosa", "petal_length"].min()\r
\r
    assert setosaMaxPetalLength < nonSetosaMinPetalLength\r
    iris.groupby("species")[["petal_length", "petal_width"]].mean().round(2)\r
  exercise:\r
    prompt: 9단계. 차트 검증 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      requiredColumns = {"sepal_length", "sepal_width", "petal_length", "petal_width", "species"}\r
      missingColumns = requiredColumns - set(iris.columns)\r
      speciesCounts = iris["species"].value_counts().to_dict()\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert iris.shape == (150, 5)\r
      assert speciesCounts == {"setosa": 50, "versicolor": 50, "virginica": 50}\r
\r
      setosaMaxPetalLength = iris.loc[iris["species"] == "setosa", "petal_length"].max()\r
      nonSetosaMinPetalLength = iris.loc[iris["species"] != "setosa", "petal_length"].min()\r
\r
      assert setosaMaxPetalLength < nonSetosaMinPetalLength\r
      iris.groupby("species")[["petal_length", "petal_width"]].mean().round(2)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 차트 검증 루프에서 \`requiredColumns\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 차트 검증 루프에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 붓꽃 인코딩 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    배운 내용을 정리하면, 이 프로젝트에서는 mark_point와 mark_circle로 점을 그렸습니다. mark_circle은 채워진 원을 그립니다. encode()에서 color로 색상, size로 크기, shape로 모양을 지정했습니다. 여러 인코딩을 조합하면 한 차트에 많은 정보를 담을 수 있습니다. alt.X(), alt.Color() 등으로 축 제목을 설정하고, properties()로 차트 크기를 조절했습니다. 각 미션에서 이 개념들을 활용해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    flower = loadLocalDataset("iris")\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      flower = loadLocalDataset("iris")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Altair로 붓꽃 품종을 시각적으로 구분하는 방법을 배웠습니다!\r
  - type: list\r
    items:\r
    - mark_point() - 점 마크 (이전 프로젝트 복습)\r
    - mark_circle(size, opacity) - 채워진 원 마크, 스타일 고정값 지정\r
    - x, y 인코딩 - 위치 매핑 (복습)\r
    - color 인코딩 - 색상으로 범주 구분 (복습)\r
    - size 인코딩 - 크기로 수치 표현 (새로 배움)\r
    - shape 인코딩 - 모양으로 범주 구분 (새로 배움)\r
    - :Q, :N 타입 - 수량형/명목형 데이터 타입\r
  - type: text\r
    content: 다음 프로젝트에서는 팁 데이터로 막대 차트와 집계 함수를 배웁니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
`;export{e as default};