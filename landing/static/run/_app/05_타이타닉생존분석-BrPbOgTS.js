var e=`meta:\r
  packages:\r
  - altair\r
  - pandas\r
  id: altair_05\r
  title: 타이타닉생존분석\r
  order: 5\r
  category: altair\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - row\r
  - column\r
  - facet\r
  - transform_filter\r
  - titanic\r
  seo:\r
    title: Altair 패싯 차트 - 타이타닉 생존 분석\r
    description: Altair로 패싯 차트를 만들고 데이터를 필터링합니다. row/column, facet, transform_filter를 배웁니다.\r
    keywords:\r
    - altair facet\r
    - row column\r
    - transform_filter\r
    - titanic\r
intro:\r
  emoji: 🚢\r
  goal: 타이타닉 승객 데이터를 패싯 차트로 분할하고 생존율을 분석합니다.\r
  description: row/column 인코딩으로 차트를 분할하고, transform_filter로 데이터를 필터링합니다.\r
  direction: 타이타닉생존분석에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.\r
  benefits:\r
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.\r
  - 타이타닉생존분석 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 막대 차트 처리 실행\r
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 행 분할 결과 검증\r
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.\r
    - label: 타이타닉생존분석 재사용\r
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 선언형 차트 환경\r
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 타이타닉생존분석 실행\r
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.\r
    - label: 타이타닉생존분석 완료\r
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: seaborn-data\r
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Codaro 로컬 데이터셋에서 titanic 데이터를 불러옵니다. 타이타닉호 승객의 생존 여부와 정보가 담긴 데이터입니다. survived(생존여부), pclass(객실등급),\r
    sex(성별), age(나이), fare(요금), embarked(승선항) 등 컬럼이 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    import warnings\r
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    titanic = loadLocalDataset("titanic")\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      import warnings\r
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      titanic = loadLocalDataset("titanic")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_basic_bar\r
  title: 2단계. 기본 막대 차트\r
  structuredPrimary: true\r
  subtitle: 생존자 수 집계\r
  goal: 2단계. 기본 막대 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    survived 컬럼은 0(사망)과 1(생존)로 구성됩니다. 생존 여부별 승객 수를 막대 차트로 표현합니다.\r
\r
    survived:N에서 :N은 명목형입니다. 0, 1 숫자지만 범주로 취급합니다.\r
  snippet: |-\r
    chartSurvived = alt.Chart(titanic).mark_bar().encode(\r
        x='survived:N',\r
        y='count()',\r
        color='survived:N'\r
    )\r
    chartSurvived\r
  exercise:\r
    prompt: 2단계. 기본 막대 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartSurvived = alt.Chart(titanic).mark_bar().encode(\r
          x='survived:N',\r
          y='count()',\r
          color='survived:N'\r
      )\r
      chartSurvived\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 기본 막대 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 기본 막대 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_row_encoding\r
  title: 3단계. 행 분할\r
  structuredPrimary: true\r
  subtitle: row 인코딩\r
  goal: 3단계. 행 분할에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    row 인코딩으로 차트를 여러 행으로 분할합니다. encode() 괄호 안에 row='sex:N'을 추가하면 됩니다. 성별(sex)로 분할하면 남녀 생존율을 각각 따로 차트로 보여줍니다. 위아래로 두 개의 차트가 나열됩니다. 같은 차트를 여러 조건별로 나누어 보여주는 것을 "패싯(facet)"이라고 합니다.\r
\r
    row는 "행"을 의미합니다. row='sex:N'은 성별 값(male, female)마다 행을 하나씩 만들어 차트를 위아래로 배치합니다. column은 "열"을 의미하며, 차트를 좌우로 배치합니다. row와 column을 함께 사용하면 2차원 그리드를 만들 수 있습니다.\r
  tips:\r
  - row는 "행"을 의미합니다. row='sex:N'은 성별 값(male, female)마다 행을 하나씩 만들어 차트를 위아래로 배치합니다. column은 "열"을 의미하며, 차트를\r
    좌우로 배치합니다. row와 column을 함께 사용하면 2차원 그리드를 만들 수 있습니다.\r
  snippet: |-\r
    chartRow = alt.Chart(titanic).mark_bar().encode(\r
        x='survived:N',\r
        y='count()',\r
        color='survived:N',\r
        row='sex:N'\r
    )\r
    chartRow\r
  exercise:\r
    prompt: 3단계. 행 분할 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartRow = alt.Chart(titanic).mark_bar().encode(\r
          x='survived:N',\r
          y='count()',\r
          color='survived:N',\r
          row='sex:N'\r
      )\r
      chartRow\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 행 분할의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 행 분할의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_column_encoding\r
  title: 4단계. 열 분할\r
  structuredPrimary: true\r
  subtitle: column 인코딩\r
  goal: 4단계. 열 분할에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    column 인코딩으로 차트를 가로로 분할합니다. 객실 등급(pclass)으로 분할해봅니다.\r
\r
    pclass는 1, 2, 3등급으로 순서가 있어 :O(순서형)를 사용합니다. 1등급 생존율이 가장 높습니다.\r
  snippet: |-\r
    chartColumn = alt.Chart(titanic).mark_bar().encode(\r
        x='survived:N',\r
        y='count()',\r
        color='survived:N',\r
        column='pclass:O'\r
    )\r
    chartColumn\r
  exercise:\r
    prompt: 4단계. 열 분할 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartColumn = alt.Chart(titanic).mark_bar().encode(\r
          x='survived:N',\r
          y='count()',\r
          color='survived:N',\r
          column='pclass:O'\r
      )\r
      chartColumn\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 열 분할의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 열 분할의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_row_column\r
  title: 5단계. 행+열 분할\r
  structuredPrimary: true\r
  subtitle: 2차원 패싯\r
  goal: 5단계. 행+열 분할에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: row와 column을 함께 사용하면 2차원 그리드로 분할됩니다. 성별(row)과 등급(column)의 조합별 생존율을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartGrid = alt.Chart(titanic).mark_bar().encode(\r
        x='survived:N', y='count()', color='survived:N',\r
        row='sex:N', column='pclass:O'\r
    ).properties(width=120, height=100)\r
    chartGrid\r
  exercise:\r
    prompt: 5단계. 행+열 분할 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartGrid = alt.Chart(titanic).mark_bar().encode(\r
          x='survived:N', y='count()', color='survived:N',\r
          row='sex:N', column='pclass:O'\r
      ).properties(width=120, height=100)\r
      chartGrid\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 행+열 분할의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 행+열 분할의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_transform_filter\r
  title: 6단계. 데이터 필터링\r
  structuredPrimary: true\r
  subtitle: transform_filter\r
  goal: 6단계. 데이터 필터링에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    transform_filter()로 특정 조건의 데이터만 시각화합니다. 필터는 "걸러낸다"는 의미로, 원하는 데이터만 선택합니다. 1등급 승객만 필터링해봅니다. encode() 뒤에 .transform_filter()를 연결합니다. alt.datum.pclass == 1은 "pclass 컬럼 값이 1인 것만"이라는 조건입니다. alt.datum은 "각 데이터 행"을 의미하고, 점(.)으로 컬럼명을 연결합니다. ==는 "같다"를 의미하는 비교 연산자입니다. =(할당)과 다릅니다.\r
\r
    비교 연산자: == (같다), != (다르다), < (작다), > (크다), <= (작거나 같다), >= (크거나 같다) 논리 연산자: & (AND, 그리고), | (OR, 또는). 여러 조건을 결합할 때 사용합니다. 괄호로 각 조건을 감싸야 합니다.\r
  tips:\r
  - '비교 연산자: == (같다), != (다르다), < (작다), > (크다), <= (작거나 같다), >= (크거나 같다) 논리 연산자: & (AND, 그리고), | (OR,\r
    또는). 여러 조건을 결합할 때 사용합니다. 괄호로 각 조건을 감싸야 합니다.'\r
  snippet: |-\r
    chartFilter = alt.Chart(titanic).mark_bar().encode(\r
        x='sex:N',\r
        y='count()',\r
        color='survived:N'\r
    ).transform_filter(\r
        alt.datum.pclass == 1\r
    ).properties(\r
        title='1등급 승객 생존율'\r
    )\r
    chartFilter\r
  exercise:\r
    prompt: 6단계. 데이터 필터링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFilter = alt.Chart(titanic).mark_bar().encode(\r
          x='sex:N',\r
          y='count()',\r
          color='survived:N'\r
      ).transform_filter(\r
          alt.datum.pclass == 1\r
      ).properties(\r
          title='1등급 승객 생존율'\r
      )\r
      chartFilter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 데이터 필터링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 데이터 필터링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_multi_filter\r
  title: 7단계. 복합 필터\r
  structuredPrimary: true\r
  subtitle: 다중 조건\r
  goal: 7단계. 복합 필터에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 여러 조건을 결합해 필터링할 수 있습니다. & 연산자로 "그리고" 조건을 만듭니다. 성인(age >= 18) 여성(sex == 'female') 승객만 필터링합니다.\r
    (조건1) & (조건2) 형태로 씁니다. 각 조건을 괄호로 감싸야 합니다. 괄호 없이 쓰면 에러가 발생합니다. 문자열(female)은 작은따옴표로 감쌉니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartMultiFilter = alt.Chart(titanic).mark_bar().encode(\r
        x='pclass:O',\r
        y='count()',\r
        color='survived:N'\r
    ).transform_filter(\r
        (alt.datum.age >= 18) & (alt.datum.sex == 'female')\r
    ).properties(\r
        title='성인 여성 등급별 생존율'\r
    )\r
    chartMultiFilter\r
  exercise:\r
    prompt: 7단계. 복합 필터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartMultiFilter = alt.Chart(titanic).mark_bar().encode(\r
          x='pclass:O',\r
          y='count()',\r
          color='survived:N'\r
      ).transform_filter(\r
          (alt.datum.age >= 18) & (alt.datum.sex == 'female')\r
      ).properties(\r
          title='성인 여성 등급별 생존율'\r
      )\r
      chartMultiFilter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 복합 필터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 복합 필터의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_facet\r
  title: 8단계. facet 메서드\r
  structuredPrimary: true\r
  subtitle: 유연한 분할\r
  goal: 8단계. facet 메서드에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    facet() 메서드는 row/column 인코딩보다 유연합니다. properties() 뒤에 .facet()을 연결합니다. facet('embarked:N')은 승선 항구별로 차트를 나눕니다. columns=3은 한 줄에 3개씩 배치하라는 의미입니다. row/column은 encode() 안에 쓰지만, facet()은 메서드로 마지막에 연결합니다. facet()이 더 유연하게 레이아웃을 조정할 수 있습니다.\r
\r
    메서드 체이닝 순서: mark_bar() → encode() → properties() → facet() 순으로 연결합니다. 각 단계는 점(.)으로 연결되며, 순서를 바꾸면 에러가 발생할 수 있습니다.\r
  tips:\r
  - '메서드 체이닝 순서: mark_bar() → encode() → properties() → facet() 순으로 연결합니다. 각 단계는 점(.)으로 연결되며, 순서를 바꾸면\r
    에러가 발생할 수 있습니다.'\r
  snippet: |-\r
    chartFacet = alt.Chart(titanic).mark_bar().encode(\r
        x='survived:N', y='count()', color='survived:N'\r
    ).properties(width=100, height=80).facet('embarked:N', columns=3)\r
    chartFacet\r
  exercise:\r
    prompt: 8단계. facet 메서드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFacet = alt.Chart(titanic).mark_bar().encode(\r
          x='survived:N', y='count()', color='survived:N'\r
      ).properties(width=100, height=80).facet('embarked:N', columns=3)\r
      chartFacet\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. facet 메서드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. facet 메서드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_final\r
  title: 9단계. 최종 결과물\r
  structuredPrimary: true\r
  subtitle: 타이타닉 생존 분석\r
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 종합해 타이타닉 생존 분석 차트를 완성합니다. 성별, 등급별 생존율을 한눈에 비교합니다.\r
\r
    여성과 1등급 승객의 생존율이 높습니다. "여성과 어린이 먼저"라는 당시 관행이 데이터에 반영되어 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    chartFinal = alt.Chart(titanic).mark_bar().encode(\r
        x=alt.X('survived:N', title='생존 여부', axis=alt.Axis(labelExpr="datum.value == 1 ? '생존' : '사망'")),\r
        y=alt.Y('count()', title='승객 수'),\r
        color=alt.Color('survived:N', title='생존', legend=None),\r
        row=alt.Row('sex:N', title='성별'), column=alt.Column('pclass:O', title='객실 등급')\r
    ).properties(width=100, height=80)\r
    chartFinal\r
  exercise:\r
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      chartFinal = alt.Chart(titanic).mark_bar().encode(\r
          x=alt.X('survived:N', title='생존 여부', axis=alt.Axis(labelExpr="datum.value == 1 ? '생존' : '사망'")),\r
          y=alt.Y('count()', title='승객 수'),\r
          color=alt.Color('survived:N', title='생존', legend=None),\r
          row=alt.Row('sex:N', title='성별'), column=alt.Column('pclass:O', title='객실 등급')\r
      ).properties(width=100, height=80)\r
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
  subtitle: 타이타닉 패싯 프로젝트\r
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이 프로젝트에서 배운 내용을 정리합니다. row와 column으로 차트를 행과 열로 분할했습니다. 2차원 그리드를 만들 수 있습니다. transform_filter()로 조건에 맞는 데이터만 필터링했습니다. alt.datum.컬럼명으로 조건을 지정하고, ==, &, | 연산자를 사용합니다. facet() 메서드로 유연하게 패싯 차트를 만들었습니다. columns로 레이아웃을 조정할 수 있습니다. 각 미션에서 이 개념들을 활용해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import altair as alt\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
    ship = loadLocalDataset("titanic")\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
      ship = loadLocalDataset("titanic")\r
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
    content: Altair로 패싯 차트와 필터링을 마스터했습니다!\r
  - type: list\r
    items:\r
    - row='컬럼:N' - 행 방향으로 차트 분할\r
    - column='컬럼:N' - 열 방향으로 차트 분할\r
    - row + column - 2차원 그리드 분할\r
    - transform_filter(alt.datum.컬럼 == 값) - 데이터 필터링\r
    - '&, | 연산자 - 다중 조건 결합'\r
    - .facet('컬럼:N', columns=n) - 유연한 패싯\r
  - type: text\r
    content: 다음 프로젝트에서는 항공편 데이터로 히트맵과 박스플롯을 배웁니다.\r
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.\r
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.\r
- id: workflow_validation\r
  title: 10단계. 타이타닉 Facet 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 10단계. 타이타닉 Facet 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Facet 차트는 여러 집단을 동시에 비교하므로 생존 컬럼의 의미, 집단 표본, row/column 사양을 함께 확인해야 합니다.\r
\r
    Facet은 비교 대상을 늘리는 기능이지만, 생존율의 기준과 표본 검증 없이는 결론을 강하게 말할 수 없습니다.\r
  snippet: |-\r
    import altair as alt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    titanicFlow = loadLocalDataset("titanic")\r
    requiredColumns = {"survived", "pclass", "sex", "age", "fare"}\r
    missingColumns = requiredColumns - set(titanicFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert set(titanicFlow["survived"].unique()).issubset({0, 1})\r
    assert titanicFlow.groupby("sex")["survived"].mean()["female"] > titanicFlow.groupby("sex")["survived"].mean()["male"]\r
  exercise:\r
    prompt: 10단계. 타이타닉 Facet 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      titanicFlow = loadLocalDataset("titanic")\r
      requiredColumns = {"survived", "pclass", "sex", "age", "fare"}\r
      missingColumns = requiredColumns - set(titanicFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert set(titanicFlow["survived"].unique()).issubset({0, 1})\r
      assert titanicFlow.groupby("sex")["survived"].mean()["female"] > titanicFlow.groupby("sex")["survived"].mean()["male"]\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 타이타닉 Facet 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 타이타닉 Facet 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};