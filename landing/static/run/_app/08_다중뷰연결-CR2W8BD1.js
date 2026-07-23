var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_08\r
  title: 다중뷰연결\r
  order: 8\r
  category: altair\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - hconcat\r
  - vconcat\r
  - repeat\r
  - linked\r
  - iris\r
  seo:\r
    title: Altair 다중 뷰 - 차트 연결과 조합\r
    description: Altair로 여러 차트를 연결합니다. hconcat, vconcat, repeat로 다중 뷰 대시보드를 만듭니다.\r
    keywords:\r
    - altair concat\r
    - hconcat\r
    - vconcat\r
    - repeat\r
    - linked brush\r
intro:\r
  emoji: 🔗\r
  goal: 여러 차트를 가로/세로로 배치하고 브러싱으로 연결해 다중 뷰 대시보드를 만듭니다.\r
  description: hconcat(|), vconcat(&), repeat로 차트를 조합하고, 선택을 공유해 차트 간 연동을 구현합니다.\r
  direction: 다중뷰연결에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 다중뷰연결 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 가로 배치 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 세로 배치 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 다중뷰연결 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 다중뷰연결 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 다중뷰연결 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 iris(붓꽃) 데이터를 불러옵니다. 붓꽃 3가지 품종(setosa, versicolor, virginica)의 꽃잎과 꽃받침\r
    크기를 측정한 유명한 데이터셋입니다. sepal은 꽃받침(꽃잎을 감싸는 초록색 부분), petal은 꽃잎(색깔 있는 부분)입니다. length는 길이, width는 너비, species는\r
    품종입니다. 이 데이터로 여러 차트를 동시에 그리고 서로 연결하는 방법을 배웁니다. 한 차트를 조작하면 다른 차트도 함께 반응합니다.\r
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
- id: step2_hconcat\r
  title: 2단계. 가로 배치\r
  structuredPrimary: true\r
  subtitle: hconcat (|)\r
  goal: 2단계. 가로 배치에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지는 차트를 하나씩 그렸습니다. 이번에는 여러 차트를 한 화면에 배치하는 방법을 배웁니다. | 연산자(파이프 기호)는 차트를 가로로 나란히 붙이는 역할을 합니다. chart1 | chart2는 "차트1 옆에 차트2를 배치하라"는 뜻입니다. hconcat()도 같은 기능입니다(h는 horizontal, 가로). 먼저 각 차트를 변수에 저장한 뒤, | 연산자로 연결하면 두 차트가 가로로 나란히 표시됩니다.\r
\r
    | 기호는 키보드에서 Shift + ₩(원화 기호) 또는 Shift + \\(백슬래시)를 누르면 입력됩니다. | 연산자는 alt.hconcat()의 단축 표현입니다. concat은 concatenate(연결하다)의 줄임말입니다. 두 차트를 가로로 연결해 나란히 배치합니다.\r
  tips:\r
  - '| 기호는 키보드에서 Shift + ₩(원화 기호) 또는 Shift + \\(백슬래시)를 누르면 입력됩니다. | 연산자는 alt.hconcat()의 단축 표현입니다. concat은\r
    concatenate(연결하다)의 줄임말입니다. 두 차트를 가로로 연결해 나란히 배치합니다.'\r
  snippet: |-\r
    chartPetal = alt.Chart(iris).mark_point().encode(\r
        x='petal_length:Q',\r
        y='petal_width:Q',\r
        color='species:N'\r
    ).properties(width=200, height=200, title='꽃잎')\r
\r
    chartSepal = alt.Chart(iris).mark_point().encode(\r
        x='sepal_length:Q',\r
        y='sepal_width:Q',\r
        color='species:N'\r
    ).properties(width=200, height=200, title='꽃받침')\r
\r
    chartHconcat = chartPetal | chartSepal\r
    chartHconcat\r
  exercise:\r
    prompt: 2단계. 가로 배치 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartPetal = alt.Chart(iris).mark_point().encode(\r
          x='petal_length:Q',\r
          y='petal_width:Q',\r
          color='species:N'\r
      ).properties(width=200, height=200, title='꽃잎')\r
\r
      chartSepal = alt.Chart(iris).mark_point().encode(\r
          x='sepal_length:Q',\r
          y='sepal_width:Q',\r
          color='species:N'\r
      ).properties(width=200, height=200, title='꽃받침')\r
\r
      chartHconcat = chartPetal | chartSepal\r
      chartHconcat\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 가로 배치의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 가로 배치의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_vconcat\r
  title: 3단계. 세로 배치\r
  structuredPrimary: true\r
  subtitle: vconcat (&)\r
  goal: 3단계. 세로 배치에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    가로 배치를 배웠으니 이번에는 세로 배치를 해봅니다. & 연산자는 차트를 위아래로 쌓는 역할을 합니다. chart1 & chart2는 "차트1 아래에 차트2를 배치하라"는 뜻입니다. vconcat()도 같은 기능입니다(v는 vertical, 세로). | 는 옆으로 붙이고, &는 아래로 쌓는다고 기억하면 됩니다.\r
\r
    & 연산자는 alt.vconcat()의 단축 표현입니다. 차트들이 세로로 쌓입니다.\r
  snippet: |-\r
    chartVconcat = chartPetal & chartSepal\r
    chartVconcat\r
  exercise:\r
    prompt: 3단계. 세로 배치 예제에서 \`chartVconcat\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartVconcat = chartPetal & chartSepal\r
      chartVconcat\r
    hints:\r
    - 바꿀 지점은 \`chartVconcat = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`chartVconcat\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 세로 배치에서 \`chartVconcat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 세로 배치 실행 뒤 \`chartVconcat\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step4_grid\r
  title: 4단계. 그리드 배치\r
  structuredPrimary: true\r
  subtitle: 가로+세로 조합\r
  goal: 4단계. 그리드 배치에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: '| 와 & 를 동시에 사용하면 복잡한 레이아웃을 만들 수 있습니다. 괄호로 순서를 정해주면 2x2, 3x3 같은 그리드를 만들 수 있습니다. (chart1\r
    | chart2)는 먼저 차트1과 차트2를 가로로 붙입니다. (chart3 | chart4)도 가로로 붙입니다. 그 다음 두 묶음을 & 로 세로로 쌓으면 2행 2열 그리드가 됩니다.\r
    괄호가 중요합니다. 수학 계산처럼 괄호 안을 먼저 처리합니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chart1 = alt.Chart(iris).mark_point().encode(\r
        x='sepal_length:Q', y='sepal_width:Q', color='species:N'\r
    ).properties(width=180, height=180, title='꽃받침 L vs W')\r
\r
    chart2 = alt.Chart(iris).mark_point().encode(\r
        x='petal_length:Q', y='petal_width:Q', color='species:N'\r
    ).properties(width=180, height=180, title='꽃잎 L vs W')\r
\r
    chart3 = alt.Chart(iris).mark_point().encode(\r
        x='sepal_length:Q', y='petal_length:Q', color='species:N'\r
    ).properties(width=180, height=180, title='길이 비교')\r
\r
    chart4 = alt.Chart(iris).mark_point().encode(\r
        x='sepal_width:Q', y='petal_width:Q', color='species:N'\r
    ).properties(width=180, height=180, title='너비 비교')\r
\r
    chartGrid = (chart1 | chart2) & (chart3 | chart4)\r
    chartGrid\r
  exercise:\r
    prompt: 4단계. 그리드 배치 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chart1 = alt.Chart(iris).mark_point().encode(\r
          x='sepal_length:Q', y='sepal_width:Q', color='species:N'\r
      ).properties(width=180, height=180, title='꽃받침 L vs W')\r
\r
      chart2 = alt.Chart(iris).mark_point().encode(\r
          x='petal_length:Q', y='petal_width:Q', color='species:N'\r
      ).properties(width=180, height=180, title='꽃잎 L vs W')\r
\r
      chart3 = alt.Chart(iris).mark_point().encode(\r
          x='sepal_length:Q', y='petal_length:Q', color='species:N'\r
      ).properties(width=180, height=180, title='길이 비교')\r
\r
      chart4 = alt.Chart(iris).mark_point().encode(\r
          x='sepal_width:Q', y='petal_width:Q', color='species:N'\r
      ).properties(width=180, height=180, title='너비 비교')\r
\r
      chartGrid = (chart1 | chart2) & (chart3 | chart4)\r
      chartGrid\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 그리드 배치의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 그리드 배치의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_linked_brush\r
  title: 5단계. 연결된 브러싱\r
  structuredPrimary: true\r
  subtitle: 선택 공유\r
  goal: 5단계. 연결된 브러싱에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    이제 핵심 기능을 배웁니다. 여러 차트가 서로 연결되어 동시에 반응하게 만드는 방법입니다. 같은 brush 변수(selection_interval)를 기준 차트에 add_params()로 추가하고, 다른 차트는 그 선택 값을 참조하면 한 차트에서 드래그한 선택이 다른 차트에도 적용됩니다. 왼쪽 차트에서 영역을 드래그하면, 오른쪽 차트에서도 똑같은 데이터 포인트가 강조됩니다. 마치 두 차트가 대화하는 것처럼 연동됩니다.\r
\r
    brush 객체는 기준 차트에만 등록하고 두 차트가 같은 조건을 참조합니다. 한 쪽에서 선택하면 다른 쪽에서도 같은 데이터가 강조됩니다.\r
  snippet: |-\r
    brush = alt.selection_interval(name='linkedBrush')\r
\r
    linkedPetal = alt.Chart(iris).mark_point().encode(\r
        x='petal_length:Q',\r
        y='petal_width:Q',\r
        color=alt.when(brush).then('species:N').otherwise(alt.value('lightgray'))\r
    ).properties(width=250, height=250, title='꽃잎 (드래그로 선택)').add_params(brush)\r
\r
    linkedSepal = alt.Chart(iris).mark_point().encode(\r
        x='sepal_length:Q',\r
        y='sepal_width:Q',\r
        color=alt.when(brush).then('species:N').otherwise(alt.value('lightgray'))\r
    ).properties(width=250, height=250, title='꽃받침 (연동됨)')\r
\r
    chartLinked = linkedPetal | linkedSepal\r
    chartLinked\r
  exercise:\r
    prompt: 5단계. 연결된 브러싱 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brush = alt.selection_interval(name='linkedBrush')\r
\r
      linkedPetal = alt.Chart(iris).mark_point().encode(\r
          x='petal_length:Q',\r
          y='petal_width:Q',\r
          color=alt.when(brush).then('species:N').otherwise(alt.value('lightgray'))\r
      ).properties(width=250, height=250, title='꽃잎 (드래그로 선택)').add_params(brush)\r
\r
      linkedSepal = alt.Chart(iris).mark_point().encode(\r
          x='sepal_length:Q',\r
          y='sepal_width:Q',\r
          color=alt.when(brush).then('species:N').otherwise(alt.value('lightgray'))\r
      ).properties(width=250, height=250, title='꽃받침 (연동됨)')\r
\r
      chartLinked = linkedPetal | linkedSepal\r
      chartLinked\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 연결된 브러싱의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 연결된 브러싱의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_repeat\r
  title: 6단계. repeat 차트\r
  structuredPrimary: true\r
  subtitle: 변수 조합 자동화\r
  goal: 6단계. repeat 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지는 차트를 하나하나 만들어서 조합했습니다. repeat()를 사용하면 변수 조합을 자동으로 만들어줍니다. repeat()는 "반복하다"라는 뜻입니다. row와 column에 변수 리스트를 지정하면, 모든 조합의 차트를 자동으로 생성합니다. alt.repeat('column')은 "column 리스트의 변수를 반복해서 사용하라"는 의미입니다. row에 2개, column에 2개 변수를 주면 2×2=4개 차트가 자동 생성됩니다.\r
\r
    alt.X(alt.repeat('column'), type='quantitative')는 "X축에 column 리스트의 변수를 반복해서 넣고, 타입은 수량형으로 하라"는 뜻입니다. repeat()에 row=['A', 'B'], column=['C', 'D']를 지정하면, A-C, A-D, B-C, B-D 총 4개 조합이 자동으로 만들어집니다. 일일이 차트를 만들 필요가 없어 편리합니다.\r
  tips:\r
  - alt.X(alt.repeat('column'), type='quantitative')는 "X축에 column 리스트의 변수를 반복해서 넣고, 타입은 수량형으로 하라"는 뜻입니다.\r
    repeat()에 row=['A', 'B'], column=['C', 'D']를 지정하면, A-C, A-D, B-C, B-D 총 4개 조합이 자동으로 만들어집니다. 일일이 차트를\r
    만들 필요가 없어 편리합니다.\r
  snippet: |-\r
    chartRepeat = alt.Chart(iris).mark_point().encode(\r
        alt.X(alt.repeat('column'), type='quantitative'),\r
        alt.Y(alt.repeat('row'), type='quantitative'),\r
        color='species:N'\r
    ).properties(\r
        width=150,\r
        height=150\r
    ).repeat(\r
        row=['sepal_length', 'sepal_width'],\r
        column=['petal_length', 'petal_width']\r
    )\r
    chartRepeat\r
  exercise:\r
    prompt: 6단계. repeat 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartRepeat = alt.Chart(iris).mark_point().encode(\r
          alt.X(alt.repeat('column'), type='quantitative'),\r
          alt.Y(alt.repeat('row'), type='quantitative'),\r
          color='species:N'\r
      ).properties(\r
          width=150,\r
          height=150\r
      ).repeat(\r
          row=['sepal_length', 'sepal_width'],\r
          column=['petal_length', 'petal_width']\r
      )\r
      chartRepeat\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. repeat 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. repeat 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_repeat_linked\r
  title: 7단계. repeat + 연결 브러싱\r
  structuredPrimary: true\r
  subtitle: 그리드 전체 연동\r
  goal: 7단계. repeat + 연결 브러싱에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: repeat 차트에도 연결된 브러싱을 적용할 수 있습니다. add_params(brush)를 추가하면 모든 패널에서 동일한 선택이 공유됩니다. 한 패널에서\r
    드래그하면 모든 패널이 동시에 연동되어 해당 데이터가 강조됩니다. 여러 변수 조합을 동시에 탐색할 때 매우 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    brushRepeat = alt.selection_interval(name='repeatBrush')\r
\r
    chartRepeatLinked = alt.Chart(iris).mark_point().encode(\r
        alt.X(alt.repeat('column'), type='quantitative'),\r
        alt.Y(alt.repeat('row'), type='quantitative'),\r
        color=alt.when(brushRepeat).then('species:N').otherwise(alt.value('lightgray'))\r
    ).properties(\r
        width=140,\r
        height=140\r
    ).add_params(brushRepeat).repeat(\r
        row=['sepal_length', 'petal_length'],\r
        column=['sepal_width', 'petal_width']\r
    )\r
    chartRepeatLinked\r
  exercise:\r
    prompt: 7단계. repeat + 연결 브러싱 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brushRepeat = alt.selection_interval(name='repeatBrush')\r
\r
      chartRepeatLinked = alt.Chart(iris).mark_point().encode(\r
          alt.X(alt.repeat('column'), type='quantitative'),\r
          alt.Y(alt.repeat('row'), type='quantitative'),\r
          color=alt.when(brushRepeat).then('species:N').otherwise(alt.value('lightgray'))\r
      ).properties(\r
          width=140,\r
          height=140\r
      ).add_params(brushRepeat).repeat(\r
          row=['sepal_length', 'petal_length'],\r
          column=['sepal_width', 'petal_width']\r
      )\r
      chartRepeatLinked\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. repeat + 연결 브러싱의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. repeat + 연결 브러싱의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_scatter_matrix\r
  title: 8단계. 산점도 매트릭스\r
  structuredPrimary: true\r
  subtitle: SPLOM\r
  goal: 8단계. 산점도 매트릭스에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 같은 변수 리스트를 row와 column에 지정하면 산점도 매트릭스(SPLOM, Scatterplot Matrix)가 됩니다. 4개 변수를 지정하면 4×4=16개\r
    패널이 생성됩니다. 대각선은 같은 변수끼리의 조합이므로 점들이 일직선에 놓입니다. 나머지 패널에서는 모든 변수 쌍의 상관관계를 한눈에 파악할 수 있어 탐색적 데이터 분석에 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    brushMatrix = alt.selection_interval(name='matrixBrush')\r
    variables = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']\r
\r
    chartMatrix = alt.Chart(iris).mark_circle(size=30).encode(\r
        alt.X(alt.repeat('column'), type='quantitative'),\r
        alt.Y(alt.repeat('row'), type='quantitative'),\r
        color=alt.when(brushMatrix).then('species:N').otherwise(alt.value('lightgray')),\r
        opacity=alt.when(brushMatrix).then(alt.value(0.8)).otherwise(alt.value(0.3))\r
    ).properties(\r
        width=100,\r
        height=100\r
    ).add_params(brushMatrix).repeat(\r
        row=variables,\r
        column=variables\r
    )\r
    chartMatrix\r
  exercise:\r
    prompt: 8단계. 산점도 매트릭스 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brushMatrix = alt.selection_interval(name='matrixBrush')\r
      variables = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width']\r
\r
      chartMatrix = alt.Chart(iris).mark_circle(size=30).encode(\r
          alt.X(alt.repeat('column'), type='quantitative'),\r
          alt.Y(alt.repeat('row'), type='quantitative'),\r
          color=alt.when(brushMatrix).then('species:N').otherwise(alt.value('lightgray')),\r
          opacity=alt.when(brushMatrix).then(alt.value(0.8)).otherwise(alt.value(0.3))\r
      ).properties(\r
          width=100,\r
          height=100\r
      ).add_params(brushMatrix).repeat(\r
          row=variables,\r
          column=variables\r
      )\r
      chartMatrix\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 산점도 매트릭스의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 산점도 매트릭스의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_final\r
  title: 9단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 다중 뷰 대시보드\r
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 모든 개념을 종합해 다중 뷰 대시보드를 완성합니다. 산점도와 막대 차트를 조합하고 연결된 브러싱을 적용합니다.\r
\r
    산점도에서 영역을 선택하면 해당 데이터 포인트가 강조되고, 막대 차트에서도 해당 품종이 강조됩니다. 두 차트가 연동되어 데이터 탐색이 용이합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    brushFinal = alt.selection_interval(name='finalBrush')\r
\r
    scatterFinal = alt.Chart(iris).mark_circle(size=60).encode(\r
        x=alt.X('petal_length:Q', title='꽃잎 길이'),\r
        y=alt.Y('petal_width:Q', title='꽃잎 너비'),\r
        color=alt.when(brushFinal).then('species:N').otherwise(alt.value('lightgray')),\r
        tooltip=['species', 'petal_length', 'petal_width']\r
    ).properties(\r
        width=350,\r
        height=300,\r
        title='꽃잎 특성 (드래그로 선택)'\r
    )\r
\r
    barFinal = alt.Chart(iris).mark_bar().encode(\r
        x='count()',\r
        y=alt.Y('species:N', title='품종'),\r
        color=alt.when(brushFinal).then('species:N').otherwise(alt.value('lightgray'))\r
    ).properties(\r
        width=350,\r
        height=100,\r
        title='품종별 개수'\r
    ).add_params(brushFinal)\r
\r
    chartFinal = scatterFinal & barFinal\r
    chartFinal\r
  exercise:\r
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      brushFinal = alt.selection_interval(name='finalBrush')\r
\r
      scatterFinal = alt.Chart(iris).mark_circle(size=60).encode(\r
          x=alt.X('petal_length:Q', title='꽃잎 길이'),\r
          y=alt.Y('petal_width:Q', title='꽃잎 너비'),\r
          color=alt.when(brushFinal).then('species:N').otherwise(alt.value('lightgray')),\r
          tooltip=['species', 'petal_length', 'petal_width']\r
      ).properties(\r
          width=350,\r
          height=300,\r
          title='꽃잎 특성 (드래그로 선택)'\r
      )\r
\r
      barFinal = alt.Chart(iris).mark_bar().encode(\r
          x='count()',\r
          y=alt.Y('species:N', title='품종'),\r
          color=alt.when(brushFinal).then('species:N').otherwise(alt.value('lightgray'))\r
      ).properties(\r
          width=350,\r
          height=100,\r
          title='품종별 개수'\r
      ).add_params(brushFinal)\r
\r
      chartFinal = scatterFinal & barFinal\r
      chartFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 다중 뷰 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리하면: | 연산자로 가로 배치, & 연산자로 세로 배치, 괄호로 그리드 레이아웃, 같은 selection 변수를 공유해 차트 연동, repeat()로 변수 조합 자동화, alt.repeat()로 변수 참조입니다. 이제 배운 개념들을 조합해 다중 뷰 차트를 만들어봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    flower = loadLocalDataset("iris")\r
    brushLen = alt.selection_interval(name='lengthBrush')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      flower = loadLocalDataset("iris")\r
      brushLen = alt.selection_interval(name='lengthBrush')\r
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
    content: Altair로 다중 뷰 대시보드를 마스터했습니다!\r
  - type: list\r
    items:\r
    - chart1 | chart2 (hconcat) - 가로 배치\r
    - chart1 & chart2 (vconcat) - 세로 배치\r
    - (a | b) & (c | d) - 그리드 레이아웃\r
    - repeat(row=[...], column=[...]) - 변수 조합 자동화\r
    - alt.repeat('column'), alt.repeat('row') - repeat 변수 참조\r
    - 같은 selection 공유 - 연결된 브러싱\r
  - type: text\r
    content: 다음 프로젝트에서는 고급 데이터 변환 기법을 배웁니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
- id: workflow_validation\r
  title: 10단계. 다중 뷰 연결 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 10단계. 다중 뷰 연결 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    다중 뷰는 한 차트의 선택이 다른 차트와 연결되는 구조입니다. concat 구조와 selection parameter가 spec에 남는지 확인해야 합니다.\r
\r
    다중 뷰 레슨은 화면 배치보다 selection parameter가 실제 spec에 연결됐는지를 확인해야 합니다.\r
  snippet: |-\r
    import altair as alt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    irisFlow = loadLocalDataset("iris")\r
    requiredColumns = {"sepal_length", "sepal_width", "petal_length", "petal_width", "species"}\r
    missingColumns = requiredColumns - set(irisFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert irisFlow["species"].nunique() == 3\r
    assert irisFlow.loc[irisFlow["species"] == "setosa", "petal_length"].max() < irisFlow.loc[irisFlow["species"] != "setosa", "petal_length"].min()\r
  exercise:\r
    prompt: 10단계. 다중 뷰 연결 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      irisFlow = loadLocalDataset("iris")\r
      requiredColumns = {"sepal_length", "sepal_width", "petal_length", "petal_width", "species"}\r
      missingColumns = requiredColumns - set(irisFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert irisFlow["species"].nunique() == 3\r
      assert irisFlow.loc[irisFlow["species"] == "setosa", "petal_length"].max() < irisFlow.loc[irisFlow["species"] != "setosa", "petal_length"].min()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 다중 뷰 연결 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 다중 뷰 연결 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};