var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_07\r
  title: 인터랙티브필터\r
  order: 7\r
  category: altair\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - selection\r
  - when\r
  - bind\r
  - interactive\r
  - mpg\r
  seo:\r
    title: Altair 인터랙티브 - 선택과 필터링\r
    description: Altair로 인터랙티브 차트를 만듭니다. selection, when/then, bind로 동적 필터링을 배웁니다.\r
    keywords:\r
    - altair interactive\r
    - selection\r
    - when then\r
    - binding\r
intro:\r
  emoji: 🎮\r
  goal: 마우스 클릭과 드래그로 데이터를 동적으로 필터링하는 인터랙티브 차트를 만듭니다.\r
  description: selection_interval, selection_point, when().then().otherwise(), bind로 인터랙션을 구현합니다.\r
  direction: 인터랙티브필터에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 인터랙티브필터 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 차트 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 영역 선택 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 인터랙티브필터 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 인터랙티브필터 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 인터랙티브필터 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 mpg(Miles Per Gallon, 연비) 데이터를 불러옵니다. 1970-1980년대 자동차들의 연비 정보가 담긴 데이터입니다.\r
    horsepower는 마력(엔진 힘), mpg는 연비(갤런당 주행거리), origin은 생산국(usa, europe, japan)을 나타냅니다. 이 데이터로 사용자가 클릭하고\r
    드래그해서 조작할 수 있는 인터랙티브 차트를 만들어봅니다. 인터랙티브는 "상호작용하는"이라는 뜻으로, 마우스로 차트를 조작하면 차트가 반응하는 것을 의미합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    import warnings\r
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    mpg = loadLocalDataset("mpg")\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      import warnings\r
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      mpg = loadLocalDataset("mpg")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_basic_chart\r
  title: 2단계. 기본 차트\r
  structuredPrimary: true\r
  subtitle: 인터랙션 없는 상태\r
  goal: 2단계. 기본 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 먼저 인터랙션이 없는 기본 산점도를 만들어 비교 기준을 마련합니다. 나중에 이 차트에 인터랙션을 추가할 것입니다. 마력(x축)과 연비(y축)의 관계를 점으로\r
    표시하고, 생산국(origin)마다 다른 색상을 부여합니다. 일반적으로 마력이 높을수록 연비는 낮아지는 경향을 볼 수 있습니다. properties()로 차트 크기를 지정합니다.\r
    width는 가로 길이, height는 세로 길이입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartBasic = alt.Chart(mpg).mark_point().encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color='origin:N'\r
    ).properties(\r
        width=500,\r
        height=300\r
    )\r
    chartBasic\r
  exercise:\r
    prompt: 2단계. 기본 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartBasic = alt.Chart(mpg).mark_point().encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color='origin:N'\r
      ).properties(\r
          width=500,\r
          height=300\r
      )\r
      chartBasic\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 기본 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_interval_selection\r
  title: 3단계. 영역 선택\r
  structuredPrimary: true\r
  subtitle: selection_interval\r
  goal: 3단계. 영역 선택에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    이제 차트에 인터랙션을 추가합니다. selection_interval()은 "마우스 드래그로 사각형 영역을 선택할 수 있게 하라"는 명령입니다. interval은 "구간"이라는 뜻으로, 차트에서 특정 구간을 드래그해서 선택할 수 있습니다. 이것을 브러싱(brushing, 붓질하듯 영역을 칠한다)이라고 부릅니다. brush 변수에 선택 기능을 저장한 뒤, add_params(brush)로 차트에 추가하면 드래그 기능이 활성화됩니다.\r
\r
    alt.when().then().otherwise()는 조건문입니다. "만약 ~이면 이렇게 하고, 아니면 저렇게 하라"는 뜻입니다. when(brush)는 "brush로 선택되었으면", then('origin:N')은 "생산국 색상을 표시하고", otherwise(alt.value('lightgray'))는 "아니면 회색으로 표시하라"입니다. 결과적으로 드래그한 영역의 점만 색상이 유지되고, 나머지는 모두 회색으로 바뀌어 선택된 부분이 강조됩니다.\r
  tips:\r
  - alt.when().then().otherwise()는 조건문입니다. "만약 ~이면 이렇게 하고, 아니면 저렇게 하라"는 뜻입니다. when(brush)는 "brush로 선택되었으면",\r
    then('origin:N')은 "생산국 색상을 표시하고", otherwise(alt.value('lightgray'))는 "아니면 회색으로 표시하라"입니다. 결과적으로 드래그한\r
    영역의 점만 색상이 유지되고, 나머지는 모두 회색으로 바뀌어 선택된 부분이 강조됩니다.\r
  snippet: |-\r
    brush = alt.selection_interval()\r
\r
    chartBrush = alt.Chart(mpg).mark_point().encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray'))\r
    ).add_params(brush).properties(\r
        width=500,\r
        height=300,\r
        title='드래그로 영역 선택하기'\r
    )\r
    chartBrush\r
  exercise:\r
    prompt: 3단계. 영역 선택 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brush = alt.selection_interval()\r
\r
      chartBrush = alt.Chart(mpg).mark_point().encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color=alt.when(brush).then('origin:N').otherwise(alt.value('lightgray'))\r
      ).add_params(brush).properties(\r
          width=500,\r
          height=300,\r
          title='드래그로 영역 선택하기'\r
      )\r
      chartBrush\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 영역 선택의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 영역 선택의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_point_selection\r
  title: 4단계. 클릭 선택\r
  structuredPrimary: true\r
  subtitle: selection_point\r
  goal: 4단계. 클릭 선택에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    앞에서는 드래그로 영역을 선택했습니다. 이번에는 클릭으로 항목을 선택하는 방법을 배웁니다. selection_point()는 "마우스 클릭으로 개별 항목을 선택하게 하라"는 명령입니다. point는 "점"이라는 뜻입니다. fields=['origin'] 파라미터는 "origin(생산국) 필드 기준으로 선택하라"는 의미입니다. 범례에서 'usa'를 클릭하면 usa 자동차만 선택되고, 'japan'을 클릭하면 일본 자동차만 선택됩니다.\r
\r
    opacity도 when().then().otherwise()로 조절합니다. 선택된 점은 불투명, 나머지는 반투명으로 표시됩니다.\r
  snippet: |-\r
    click = alt.selection_point(fields=['origin'], bind='legend')\r
\r
    chartClick = alt.Chart(mpg).mark_point().encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color=alt.when(click).then('origin:N').otherwise(alt.value('lightgray')),\r
        opacity=alt.when(click).then(alt.value(1)).otherwise(alt.value(0.2))\r
    ).add_params(click).properties(\r
        width=500,\r
        height=300,\r
        title='범례 클릭으로 생산국 선택'\r
    )\r
    chartClick\r
  exercise:\r
    prompt: 4단계. 클릭 선택 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      click = alt.selection_point(fields=['origin'], bind='legend')\r
\r
      chartClick = alt.Chart(mpg).mark_point().encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color=alt.when(click).then('origin:N').otherwise(alt.value('lightgray')),\r
          opacity=alt.when(click).then(alt.value(1)).otherwise(alt.value(0.2))\r
      ).add_params(click).properties(\r
          width=500,\r
          height=300,\r
          title='범례 클릭으로 생산국 선택'\r
      )\r
      chartClick\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 클릭 선택의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 클릭 선택의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_conditional\r
  title: 5단계. 조건부 스타일링\r
  structuredPrimary: true\r
  subtitle: 다중 속성 변경\r
  goal: 5단계. 조건부 스타일링에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: when().then().otherwise()는 색상뿐만 아니라 크기(size), 투명도(opacity) 등 여러 속성에 동시에 적용할 수 있습니다. opacity는\r
    "불투명도"를 의미합니다. 값이 1이면 완전히 불투명(진하게), 0이면 완전히 투명(안 보임), 0.3이면 반투명(흐릿하게) 표시됩니다. 이 코드는 선택된 영역의 점을 크게(size=100),\r
    진하게(opacity=1) 만들고, 선택되지 않은 점은 작게(size=30), 흐릿하게(opacity=0.3) 만들어 대비를 극대화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    brushStyle = alt.selection_interval()\r
\r
    chartCondition = alt.Chart(mpg).mark_point().encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color=alt.when(brushStyle).then('origin:N').otherwise(alt.value('lightgray')),\r
        size=alt.when(brushStyle).then(alt.value(100)).otherwise(alt.value(30)),\r
        opacity=alt.when(brushStyle).then(alt.value(1)).otherwise(alt.value(0.3))\r
    ).add_params(brushStyle).properties(\r
        width=500,\r
        height=300,\r
        title='선택 영역 강조'\r
    )\r
    chartCondition\r
  exercise:\r
    prompt: 5단계. 조건부 스타일링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brushStyle = alt.selection_interval()\r
\r
      chartCondition = alt.Chart(mpg).mark_point().encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color=alt.when(brushStyle).then('origin:N').otherwise(alt.value('lightgray')),\r
          size=alt.when(brushStyle).then(alt.value(100)).otherwise(alt.value(30)),\r
          opacity=alt.when(brushStyle).then(alt.value(1)).otherwise(alt.value(0.3))\r
      ).add_params(brushStyle).properties(\r
          width=500,\r
          height=300,\r
          title='선택 영역 강조'\r
      )\r
      chartCondition\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 조건부 스타일링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 조건부 스타일링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_slider\r
  title: 6단계. 슬라이더 바인딩\r
  structuredPrimary: true\r
  subtitle: binding_range\r
  goal: 6단계. 슬라이더 바인딩에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지는 마우스로 직접 차트를 클릭하거나 드래그했습니다. 이번에는 슬라이더라는 UI 위젯을 만들어봅니다. binding_range()는 "범위(range) 슬라이더를 만들어 연결(binding)하라"는 뜻입니다. min은 최솟값, max는 최댓값, step은 한 칸의 간격, name은 슬라이더 옆에 표시될 이름입니다. alt.param()으로 파라미터를 만듭니다. name은 파라미터 이름, value는 초기값(50), bind는 어떤 위젯과 연결할지 지정합니다. alt.datum.horsepower >= selectHp는 "각 데이터의 마력이 슬라이더 값 이상인가?"를 검사합니다.\r
\r
    alt.datum은 "각각의 데이터"를 의미합니다. alt.datum.horsepower는 "각 데이터 행의 horsepower 값"을 가리킵니다. >= 기호는 "크거나 같다"는 의미입니다. alt.datum.horsepower >= selectHp는 "이 데이터의 마력이 슬라이더 값 이상인가?"를 묻는 조건식입니다. 참이면 opacity=1(진하게), 거짓이면 opacity=0.1(거의 투명)로 표시됩니다.\r
  tips:\r
  - alt.datum은 "각각의 데이터"를 의미합니다. alt.datum.horsepower는 "각 데이터 행의 horsepower 값"을 가리킵니다. >= 기호는 "크거나 같다"는\r
    의미입니다. alt.datum.horsepower >= selectHp는 "이 데이터의 마력이 슬라이더 값 이상인가?"를 묻는 조건식입니다. 참이면 opacity=1(진하게),\r
    거짓이면 opacity=0.1(거의 투명)로 표시됩니다.\r
  snippet: |-\r
    sliderHp = alt.binding_range(min=0, max=200, step=10, name='최소 마력: ')\r
    selectHp = alt.param(name='minHorsepower', value=50, bind=sliderHp)\r
\r
    chartSlider = alt.Chart(mpg).mark_point().encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color='origin:N',\r
        opacity=alt.when(\r
            alt.datum.horsepower >= selectHp\r
        ).then(alt.value(1)).otherwise(alt.value(0.1))\r
    ).add_params(selectHp).properties(\r
        width=500,\r
        height=300,\r
        title='슬라이더로 마력 필터링'\r
    )\r
    chartSlider\r
  exercise:\r
    prompt: 6단계. 슬라이더 바인딩 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      sliderHp = alt.binding_range(min=0, max=200, step=10, name='최소 마력: ')\r
      selectHp = alt.param(name='minHorsepower', value=50, bind=sliderHp)\r
\r
      chartSlider = alt.Chart(mpg).mark_point().encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color='origin:N',\r
          opacity=alt.when(\r
              alt.datum.horsepower >= selectHp\r
          ).then(alt.value(1)).otherwise(alt.value(0.1))\r
      ).add_params(selectHp).properties(\r
          width=500,\r
          height=300,\r
          title='슬라이더로 마력 필터링'\r
      )\r
      chartSlider\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 슬라이더 바인딩의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 슬라이더 바인딩의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_dropdown\r
  title: 7단계. 드롭다운 바인딩\r
  structuredPrimary: true\r
  subtitle: binding_select\r
  goal: 7단계. 드롭다운 바인딩에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 슬라이더는 숫자 범위를 조절하는 위젯이었습니다. 이번에는 카테고리를 선택하는 드롭다운 메뉴를 만들어봅니다. binding_select()는 "선택(select)\r
    메뉴를 만들어 연결(binding)하라"는 뜻입니다. options는 선택지 목록, labels는 화면에 표시될 이름, name은 드롭다운 이름입니다. [None] + origins는\r
    리스트 합치기입니다. None(전체)을 첫 번째 항목으로 추가하고, 그 뒤에 usa, europe, japan을 붙입니다. | 기호는 "또는"이라는 뜻으로, (조건1) | (조건2)는\r
    "조건1이거나 조건2이면"을 의미합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    origins = ['usa', 'europe', 'japan']\r
    dropdown = alt.binding_select(options=[None] + origins, labels=['전체'] + origins, name='생산국: ')\r
    selectOrigin = alt.param(name='selectedOrigin', bind=dropdown)\r
\r
    chartDropdown = alt.Chart(mpg).mark_point().encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color='origin:N',\r
        opacity=alt.when(\r
            (selectOrigin == None) | (alt.datum.origin == selectOrigin)\r
        ).then(alt.value(1)).otherwise(alt.value(0.1))\r
    ).add_params(selectOrigin).properties(\r
        width=500,\r
        height=300,\r
        title='드롭다운으로 생산국 필터링'\r
    )\r
    chartDropdown\r
  exercise:\r
    prompt: 7단계. 드롭다운 바인딩 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      origins = ['usa', 'europe', 'japan']\r
      dropdown = alt.binding_select(options=[None] + origins, labels=['전체'] + origins, name='생산국: ')\r
      selectOrigin = alt.param(name='selectedOrigin', bind=dropdown)\r
\r
      chartDropdown = alt.Chart(mpg).mark_point().encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color='origin:N',\r
          opacity=alt.when(\r
              (selectOrigin == None) | (alt.datum.origin == selectOrigin)\r
          ).then(alt.value(1)).otherwise(alt.value(0.1))\r
      ).add_params(selectOrigin).properties(\r
          width=500,\r
          height=300,\r
          title='드롭다운으로 생산국 필터링'\r
      )\r
      chartDropdown\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 드롭다운 바인딩의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 드롭다운 바인딩의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_combined\r
  title: 8단계. 복합 인터랙션\r
  structuredPrimary: true\r
  subtitle: 여러 컨트롤 조합\r
  goal: 8단계. 복합 인터랙션에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 슬라이더와 드롭다운을 하나의 차트에 동시에 적용해봅니다. 두 가지 조건을 모두 만족하는 데이터만 강조됩니다. & 기호는 "그리고"라는 뜻입니다.\r
    (조건1) & (조건2)는 "조건1이면서 동시에 조건2도 만족해야"를 의미합니다. 앞에서 배운 | (또는)와 반대입니다. 이 코드는 "드롭다운에서 선택한 생산국이면서, 동시에\r
    슬라이더 값 이상의 마력을 가진" 자동차만 opacity=0.8로 진하게 표시하고, 나머지는 opacity=0.1로 거의 투명하게 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    originList = ['usa', 'europe', 'japan']\r
    dropdownCombined = alt.binding_select(options=[None] + originList, labels=['전체'] + originList, name='생산국: ')\r
    paramOrigin = alt.param(name='originFilter', bind=dropdownCombined)\r
\r
    sliderCombined = alt.binding_range(min=0, max=200, step=10, name='최소 마력: ')\r
    paramHp = alt.param(name='hpFilter', value=0, bind=sliderCombined)\r
\r
    chartCombined = alt.Chart(mpg).mark_point(size=60).encode(\r
        x='horsepower:Q',\r
        y='mpg:Q',\r
        color='origin:N',\r
        opacity=alt.when(\r
            ((paramOrigin == None) | (alt.datum.origin == paramOrigin)) &\r
            (alt.datum.horsepower >= paramHp)\r
        ).then(alt.value(0.8)).otherwise(alt.value(0.1))\r
    ).add_params(paramOrigin, paramHp).properties(\r
        width=500,\r
        height=300,\r
        title='복합 필터 대시보드'\r
    )\r
    chartCombined\r
  exercise:\r
    prompt: 8단계. 복합 인터랙션 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      originList = ['usa', 'europe', 'japan']\r
      dropdownCombined = alt.binding_select(options=[None] + originList, labels=['전체'] + originList, name='생산국: ')\r
      paramOrigin = alt.param(name='originFilter', bind=dropdownCombined)\r
\r
      sliderCombined = alt.binding_range(min=0, max=200, step=10, name='최소 마력: ')\r
      paramHp = alt.param(name='hpFilter', value=0, bind=sliderCombined)\r
\r
      chartCombined = alt.Chart(mpg).mark_point(size=60).encode(\r
          x='horsepower:Q',\r
          y='mpg:Q',\r
          color='origin:N',\r
          opacity=alt.when(\r
              ((paramOrigin == None) | (alt.datum.origin == paramOrigin)) &\r
              (alt.datum.horsepower >= paramHp)\r
          ).then(alt.value(0.8)).otherwise(alt.value(0.1))\r
      ).add_params(paramOrigin, paramHp).properties(\r
          width=500,\r
          height=300,\r
          title='복합 필터 대시보드'\r
      )\r
      chartCombined\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 복합 인터랙션의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 복합 인터랙션의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_final\r
  title: 9단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 인터랙티브 대시보드\r
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    이제 지금까지 배운 모든 인터랙션 기능을 하나로 합쳐봅니다. 브러싱(드래그), 드롭다운, 슬라이더가 모두 포함된 대시보드입니다. 세 가지 파라미터(brushFinal, paramOriginFinal, paramHpFinal)를 add_params()에 쉼표로 구분해서 모두 추가합니다. 사용자는 드롭다운으로 생산국을 고르고, 슬라이더로 최소 마력을 조절하고, 마우스로 차트를 드래그해서 원하는 데이터를 찾을 수 있습니다. 세 가지 필터가 동시에 작동합니다.\r
\r
    드롭다운으로 생산국을 선택하고, 슬라이더로 마력 범위를 조절하고, 마우스 드래그로 영역을 선택할 수 있습니다. 세 가지 필터가 동시에 적용되어 데이터를 탐색합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    originsFinal = ['usa', 'europe', 'japan']\r
    dropdownFinal = alt.binding_select(options=[None] + originsFinal, labels=['전체'] + originsFinal, name='생산국: ')\r
    paramOriginFinal = alt.param(name='originFinal', bind=dropdownFinal)\r
\r
    sliderFinal = alt.binding_range(min=0, max=200, step=10, name='최소 마력: ')\r
    paramHpFinal = alt.param(name='hpFinal', value=0, bind=sliderFinal)\r
\r
    brushFinal = alt.selection_interval()\r
\r
    chartFinal = alt.Chart(mpg).mark_circle(size=80).encode(\r
        x=alt.X('horsepower:Q', title='마력'),\r
        y=alt.Y('mpg:Q', title='연비 (MPG)'),\r
        color=alt.when(brushFinal).then('origin:N').otherwise(alt.value('lightgray')),\r
        opacity=alt.when(\r
            ((paramOriginFinal == None) | (alt.datum.origin == paramOriginFinal)) &\r
            (alt.datum.horsepower >= paramHpFinal)\r
        ).then(alt.value(0.8)).otherwise(alt.value(0.1)),\r
        tooltip=['name', 'origin', 'horsepower', 'mpg', 'cylinders']\r
    ).add_params(\r
        brushFinal,\r
        paramOriginFinal,\r
        paramHpFinal\r
    ).properties(\r
        width=550,\r
        height=350,\r
        title='자동차 연비 인터랙티브 대시보드'\r
    )\r
    chartFinal\r
  exercise:\r
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      originsFinal = ['usa', 'europe', 'japan']\r
      dropdownFinal = alt.binding_select(options=[None] + originsFinal, labels=['전체'] + originsFinal, name='생산국: ')\r
      paramOriginFinal = alt.param(name='originFinal', bind=dropdownFinal)\r
\r
      sliderFinal = alt.binding_range(min=0, max=200, step=10, name='최소 마력: ')\r
      paramHpFinal = alt.param(name='hpFinal', value=0, bind=sliderFinal)\r
\r
      brushFinal = alt.selection_interval()\r
\r
      chartFinal = alt.Chart(mpg).mark_circle(size=80).encode(\r
          x=alt.X('horsepower:Q', title='마력'),\r
          y=alt.Y('mpg:Q', title='연비 (MPG)'),\r
          color=alt.when(brushFinal).then('origin:N').otherwise(alt.value('lightgray')),\r
          opacity=alt.when(\r
              ((paramOriginFinal == None) | (alt.datum.origin == paramOriginFinal)) &\r
              (alt.datum.horsepower >= paramHpFinal)\r
          ).then(alt.value(0.8)).otherwise(alt.value(0.1)),\r
          tooltip=['name', 'origin', 'horsepower', 'mpg', 'cylinders']\r
      ).add_params(\r
          brushFinal,\r
          paramOriginFinal,\r
          paramHpFinal\r
      ).properties(\r
          width=550,\r
          height=350,\r
          title='자동차 연비 인터랙티브 대시보드'\r
      )\r
      chartFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_workflow\r
  title: 10단계. 실무 인터랙션 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 파라미터 오류 확인 → 사양 검증 → 기준 실험\r
  goal: 10단계. 실무 인터랙션 검증에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 인터랙티브 차트는 눈으로만 확인하면 놓치는 부분이 많습니다. 슬라이더와 드롭다운이 실제 차트 사양에 연결됐는지, 브러싱 파라미터가 색상 조건에 들어갔는지,\r
    툴팁에 필요한 필드가 있는지 코드로 검사해야 합니다. 이번 단계에서는 생산국별 연비를 먼저 예측하고, 파라미터가 빠진 차트를 일부러 실패시킨 뒤, 완성 차트의 인터랙션 사양을\r
    검증합니다. 마지막에는 마력 기준을 바꿔 필터 결과가 어떻게 줄어드는지 실험합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    requiredColumns = {"name", "origin", "horsepower", "mpg", "cylinders"}\r
    missingColumns = requiredColumns - set(mpg.columns)\r
    if missingColumns:\r
        raise ValueError(f"mpg 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")\r
\r
    mpgFiltered = mpg.dropna(subset=["horsepower", "mpg", "origin"]).copy()\r
    mpgByOrigin = (\r
        mpgFiltered.groupby("origin")["mpg"]\r
        .mean()\r
        .round(1)\r
        .sort_values(ascending=False)\r
    )\r
    bestMpgOrigin = mpgByOrigin.index[0]\r
\r
    highPowerCountByOrigin = {\r
        origin: len(mpgFiltered[(mpgFiltered["origin"] == origin) & (mpgFiltered["horsepower"] >= 120)])\r
        for origin in sorted(mpgFiltered["origin"].unique())\r
    }\r
\r
    print("생산국별 평균 연비:", mpgByOrigin.to_dict())\r
    print("예상: 평균 연비가 가장 높은 생산국은", bestMpgOrigin)\r
    print("120마력 이상 차량 수:", highPowerCountByOrigin)\r
  exercise:\r
    prompt: 10단계. 실무 인터랙션 검증 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      requiredColumns = {"name", "origin", "horsepower", "mpg", "cylinders"}\r
      missingColumns = requiredColumns - set(mpg.columns)\r
      if missingColumns:\r
          raise ValueError(f"mpg 데이터에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")\r
\r
      mpgFiltered = mpg.dropna(subset=["horsepower", "mpg", "origin"]).copy()\r
      mpgByOrigin = (\r
          mpgFiltered.groupby("origin")["mpg"]\r
          .mean()\r
          .round(1)\r
          .sort_values(ascending=False)\r
      )\r
      bestMpgOrigin = mpgByOrigin.index[0]\r
\r
      highPowerCountByOrigin = {\r
          origin: len(mpgFiltered[(mpgFiltered["origin"] == origin) & (mpgFiltered["horsepower"] >= 120)])\r
          for origin in sorted(mpgFiltered["origin"].unique())\r
      }\r
\r
      print("생산국별 평균 연비:", mpgByOrigin.to_dict())\r
      print("예상: 평균 연비가 가장 높은 생산국은", bestMpgOrigin)\r
      print("120마력 이상 차량 수:", highPowerCountByOrigin)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 실무 인터랙션 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 실무 인터랙션 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 인터랙티브 차트 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리하면: selection_interval()로 드래그 선택, selection_point()로 클릭 선택, when().then().otherwise()로 조건부 스타일, binding_range()로 슬라이더, binding_select()로 드롭다운, alt.datum으로 데이터 접근, & (그리고)와 | (또는) 연산자입니다. 이제 배운 개념들을 조합해 새로운 인터랙티브 차트를 만들어봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    car = loadLocalDataset("mpg")\r
    kinds = [3, 4, 5, 6, 8]\r
    selectCyl = alt.binding_select(options=[None] + kinds, labels=['전체'] + [str(c) for c in kinds], name='실린더: ')\r
    filterCyl = alt.param(name='cylFilter', bind=selectCyl)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      car = loadLocalDataset("mpg")\r
      kinds = [3, 4, 5, 6, 8]\r
      selectCyl = alt.binding_select(options=[None] + kinds, labels=['전체'] + [str(c) for c in kinds], name='실린더: ')\r
      filterCyl = alt.param(name='cylFilter', bind=selectCyl)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: Altair로 인터랙티브 차트를 마스터했습니다!\r
  - type: list\r
    items:\r
    - selection_interval() - 드래그로 영역 선택 (브러싱)\r
    - selection_point(fields=[...]) - 클릭으로 항목 선택\r
    - add_params() - 선택 파라미터를 차트에 연결\r
    - alt.when(selection).then().otherwise() - 조건부 인코딩\r
    - binding_range() - 슬라이더 위젯\r
    - binding_select() - 드롭다운 위젯\r
    - alt.datum.컬럼명 - 데이터 값 접근\r
  - type: text\r
    content: 다음 프로젝트에서는 여러 차트를 연결하는 다중 뷰 연동을 배웁니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
`;export{e as default};