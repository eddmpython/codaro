var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_03\r
  title: 펭귄종비교분석\r
  order: 3\r
  category: pandas\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  dataSource: codaro-local:penguins\r
  tags:\r
  - penguins\r
  - groupby\r
  - query\r
  - agg\r
  - 검증\r
  - 그룹분석\r
  seo:\r
    title: pandas groupby 완전정복 - 펭귄 데이터로 그룹별 통계\r
    description: 펭귄 데이터로 groupby를 배웁니다. 종별 평균 체중, agg로 여러 통계 한번에, query로 간결한 필터링을 실습합니다.\r
    keywords:\r
    - pandas groupby\r
    - agg\r
    - query\r
    - 그룹별 통계\r
    - 펭귄 데이터\r
intro:\r
  emoji: 🐧\r
  goal: 펭귄 3종의 신체 데이터에서 "어떤 종이 가장 클까?"를 비교 분석합니다.\r
  description: groupby를 사용하면 한번에 그룹별 통계를 구할 수 있습니다. 종마다 필터링하고 평균을 구하는 반복 작업을 한 줄로!\r
  direction: 펭귄 데이터로 groupby + agg + query를 익혀 "필터링 → 그룹 집계 → 극값 행 추출" 흐름을 한 번에 손에 익힙니다.\r
  benefits:\r
  - DataFrame을 불러와 shape/컬럼/value_counts로 입력 구조를 먼저 고정합니다.\r
  - groupby('species')['컬럼'].mean()으로 3종 평균을 한 줄에 만들고 idxmax로 극값 행을 추출합니다.\r
  - agg(['mean','min','max'])와 dict 형태로 컬럼별 다른 통계를 한 번에 구합니다.\r
  - query로 SQL WHERE 스타일 필터링을 익히고 필터링 + groupby 체인 패턴을 손에 익힙니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로드 + shape 확인\r
      detail: loadLocalDataset('penguins')로 120행 × 7컬럼 DataFrame을 만든다.\r
    - label: 2단계. value_counts + describe로 분포 확인\r
      detail: 종별 개수와 숫자 컬럼 전체 통계를 먼저 본다.\r
    - label: 3단계. groupby + agg + query 체인\r
      detail: 종별/성별 평균, 컬럼별 다른 함수, 필터링 후 그룹 집계를 단계별로 실행한다.\r
    - label: 4단계. workflow 검증\r
      detail: 합성 4행 DataFrame으로 query/groupby/idxmax 결과를 assert로 고정한다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 펭귄종비교분석 실행\r
      detail: 셀을 실행해 행/열 수, value_counts, groupby 결과와 예외 상태를 확인합니다.\r
    - label: 펭귄종비교분석 완료\r
      detail: 검증된 코드를 종별 비교 리포트 자동화로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 펭귄 데이터\r
  goal: loadLocalDataset로 penguins DataFrame을 불러오고 shape으로 행/열 수를 확인한다.\r
  why: 데이터 분석은 항상 입력 크기 확인부터 시작합니다. 120행이라는 사실을 알아야 이후 groupby 결과의 합계가 120이 되는지 검증할 수 있습니다.\r
  explanation: 펭귄 데이터셋은 남극 팔머 제도의 3개 섬을 본뜬 로컬 펭귄 120마리의 신체 측정 데이터입니다. Adelie(아델리), Gentoo(젠투), Chinstrap(턱끈)\r
    3종의 펭귄이 포함되어 있으며, 각 개체의 부리 길이, 부리 깊이, 날개 길이, 체중, 성별, 서식 섬 등이 기록되어 있습니다. 이 데이터는 iris 데이터의 현대적 대안으로\r
    자주 사용되며, groupby를 배우기에 매우 적합한 구조를 가지고 있습니다. 로컬 실행에서는 네트워크가 없어도 종별 비교 흐름을 유지하도록 같은 컬럼의 샘플 데이터를 함께 둡니다.\r
  tips:\r
  - shape는 (행 수, 열 수) 튜플입니다. 행 수를 먼저 확인하면 나중에 groupby + size의 합이 행 수와 같은지로 검증할 수 있습니다.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    penguins = loadLocalDataset("penguins")\r
    penguins.shape\r
  exercise:\r
    prompt: penguins 대신 다른 데이터셋 이름을 넣어보거나 shape 대신 columns를 호출해 결과 형태가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      penguins = loadLocalDataset("penguins")\r
      penguins.shape\r
    hints:\r
    - shape는 튜플(행, 열), columns는 Index 객체를 반환합니다.\r
    - loadLocalDataset의 첫 인자만 다른 문자열로 바꿔도 같은 호출 형태를 확인할 수 있습니다.\r
  check:\r
    type: noError\r
    noError: penguins가 DataFrame으로 정상 생성되고 shape 호출이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: shape 결과가 (행 수, 열 수) 튜플 형태이고 행 수가 0보다 커야 합니다.\r
- id: step2_value_counts\r
  title: 2단계. 종별 개수\r
  structuredPrimary: true\r
  subtitle: value_counts로 확인\r
  goal: value_counts로 species 컬럼의 종별 빈도를 확인한다.\r
  why: 그룹별 분석에 들어가기 전에 그룹마다 표본이 몇 개인지 알아야 합니다. 표본이 1~2개인 그룹은 평균이 불안정하므로 분석 정책을 미리 정할 수 있습니다.\r
  explanation: Adelie 152, Gentoo 124, Chinstrap 68마리입니다. value_counts는 컬럼의 고유 값마다 등장 횟수를 세서 내림차순으로 정렬한 Series를 반환합니다. groupby + size와 같은 결과지만 한 줄로 끝납니다.\r
  tips:\r
  - value_counts(normalize=True)를 쓰면 횟수 대신 비율을 반환합니다 - Adelie가 전체의 약 44%임을 바로 볼 수 있습니다.\r
  snippet: penguins['species'].value_counts()\r
  exercise:\r
    prompt: species 대신 sex나 island 컬럼으로 바꿔 어떤 분포가 나오는지 확인하세요.\r
    starterCode: penguins['species'].value_counts()\r
    hints:\r
    - species, sex, island는 모두 범주형 컬럼이라 value_counts가 의미 있는 결과를 줍니다.\r
    - body_mass_g 같은 연속형 컬럼에 쓰면 거의 모든 행이 unique라 결과가 길어집니다.\r
  check:\r
    type: noError\r
    noError: value_counts가 KeyError 없이 실행되고 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 인덱스가 컬럼의 고유 값들이고 값이 정수 빈도여야 합니다.\r
- id: step3_head\r
  title: 3단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 데이터 구조 파악\r
  goal: head()로 첫 5행을 보고 어떤 컬럼이 있는지 한눈에 파악한다.\r
  why: 분석을 시작하기 전 컬럼 이름과 데이터 타입을 알아야 어떤 컬럼을 groupby 기준으로 쓸지 결정할 수 있습니다. 범주형은 그룹 기준, 숫자형은 집계 대상입니다.\r
  explanation: body_mass_g(체중), flipper_length_mm(날개 길이), bill_length_mm(부리 길이) 등이 있습니다. head()는 기본 5행을 반환하지만 head(10)처럼 인자를 주면 더 많이 볼 수 있습니다. 끝 행이 궁금하면 tail()을 씁니다.\r
  tips:\r
  - 컬럼 이름이 영어 + snake_case라는 점을 기억하세요. 'body_mass_g'처럼 단위까지 컬럼 이름에 포함된 경우가 많습니다.\r
  snippet: penguins.head()\r
  exercise:\r
    prompt: head() 인자를 3이나 10으로 바꾸거나 tail()로 변경해 결과 행 수가 달라지는지 확인하세요.\r
    starterCode: penguins.head()\r
    hints:\r
    - head(n)는 처음 n행, tail(n)은 마지막 n행을 반환합니다.\r
    - 결과 DataFrame의 shape[0]가 호출에 넘긴 n과 같아야 합니다.\r
  check:\r
    type: noError\r
    noError: head() 호출이 정상 실행되어 DataFrame을 반환해야 합니다.\r
    resultCheck: 결과 DataFrame의 컬럼이 원본 컬럼과 같고 행 수가 인자(또는 기본값 5)와 일치해야 합니다.\r
- id: step3_5_describe\r
  title: 3.5단계. 전체 통계 복습\r
  structuredPrimary: true\r
  subtitle: describe()로 숫자 요약\r
  goal: describe()로 모든 숫자 컬럼의 평균/표준편차/사분위수를 한 번에 본다.\r
  why: 그룹별 평균을 보기 전에 전체 평균을 알아야 합니다. 종별 체중 4500g이 전체 평균(4200g) 대비 높은지 낮은지를 비교 기준으로 삼을 수 있습니다.\r
  explanation: |-\r
    이전 프로젝트(01번, 02번)에서 배운 describe()를 다시 활용합니다. 펭귄의 체중, 날개 길이, 부리 치수 등 모든 숫자 컬럼의 통계를 한 번에 확인할 수 있습니다. 체중은 평균 약 4200g, 최소 2700g, 최대 6300g입니다. 날개 길이는 평균 약 201mm입니다. describe()는 데이터를 처음 접할 때 전체적인 범위와 분포를 빠르게 파악하는 데 필수적입니다.\r
\r
    describe()는 pandas의 가장 기본적이면서도 강력한 메서드입니다. count(개수), mean(평균), std(표준편차), min(최소), 25%(1사분위), 50%(중앙값), 75%(3사분위), max(최대)를 자동으로 계산합니다. 이전 프로젝트에서 배운 개념을 계속 반복하면서 익숙해지는 것이 중요합니다.\r
  tips:\r
  - describe()는 기본적으로 숫자 컬럼만 요약합니다. 범주형까지 보려면 describe(include='all')을 쓰세요.\r
  snippet: penguins.describe()\r
  exercise:\r
    prompt: describe()의 인자를 include='all'로 바꾸고 species/sex 같은 범주형 컬럼이 추가되는지 확인하세요.\r
    starterCode: penguins.describe()\r
    hints:\r
    - include='all'을 주면 unique, top, freq 같은 범주형 통계도 함께 나옵니다.\r
    - 결과 DataFrame의 컬럼 수가 늘어나는지 확인하세요.\r
  check:\r
    type: noError\r
    noError: describe()가 정상 실행되어 통계 DataFrame을 반환해야 합니다.\r
    resultCheck: 결과 인덱스에 count, mean, std, min, 25%, 50%, 75%, max가 모두 포함되어야 합니다.\r
- id: step4_filter_problem\r
  title: 4단계. 필터링의 문제\r
  structuredPrimary: true\r
  subtitle: 종마다 반복 작업\r
  goal: 종별로 필터링 + 평균을 따로 구하는 방식이 왜 비효율적인지 직접 체감한다.\r
  why: groupby의 필요성을 느끼려면 먼저 그것 없이 했을 때의 번거로움을 경험해야 합니다. 3종이면 3번, 10종이면 10번 같은 코드를 반복해야 합니다.\r
  explanation: 한 종(Adelie)만 필터링해서 평균을 구하는 코드입니다. 같은 코드를 Gentoo, Chinstrap에 대해서도 반복해야 하는데, 종이 늘어나면 코드도 늘어납니다. 다음 단계의 groupby가 이 반복을 한 줄로 해결합니다.\r
  tips:\r
  - 같은 패턴을 3번 이상 복사 + 붙여넣기 하고 있다면 groupby로 묶을 수 있는 신호입니다.\r
  snippet: |-\r
    adelie = penguins[penguins['species'] == 'Adelie']\r
    adelie['body_mass_g'].mean()\r
  exercise:\r
    prompt: Adelie 대신 Gentoo로 바꿔 같은 코드를 한 번 더 실행해보고 평균값 차이를 확인하세요.\r
    starterCode: |-\r
      adelie = penguins[penguins['species'] == 'Adelie']\r
      adelie['body_mass_g'].mean()\r
    hints:\r
    - 종 이름은 'Adelie', 'Gentoo', 'Chinstrap' 세 가지입니다.\r
    - Gentoo가 가장 크고 Adelie와 Chinstrap은 비슷한 크기입니다.\r
  check:\r
    type: noError\r
    noError: 필터링과 평균 호출이 정상 실행되어 숫자를 반환해야 합니다.\r
    resultCheck: 결과가 float 평균값이고 2700~6300 사이여야 합니다.\r
- id: step5_groupby\r
  title: 5단계. groupby 기본\r
  structuredPrimary: true\r
  subtitle: 한 줄로 그룹별 통계\r
  goal: groupby('species')['body_mass_g'].mean()으로 3종의 평균 체중을 한 줄에 구한다.\r
  why: 4단계의 반복 코드가 한 줄로 압축됩니다. 이 한 줄이 SQL의 SELECT AVG(...) FROM ... GROUP BY ...에 정확히 대응한다는 점이 핵심입니다.\r
  explanation: |-\r
    groupby는 데이터를 특정 기준으로 그룹으로 묶어서 각 그룹별로 계산을 수행하는 강력한 메서드입니다. "species 컬럼을 기준으로 그룹을 만들고, 각 그룹의 body_mass_g 평균을 계산해줘"라는 의미입니다. SQL의 GROUP BY와 동일한 개념으로, Split(분할) - Apply(적용) - Combine(결합) 세 단계를 자동으로 처리합니다. 3종의 평균 체중을 단 한 줄로 계산할 수 있습니다. Gentoo가 가장 무겁고(약 5076g), Chinstrap과 Adelie는 비슷합니다.\r
\r
    groupby('컬럼')은 해당 컬럼의 고유한 값들로 그룹을 만듭니다. species에는 Adelie, Gentoo, Chinstrap 3개 값이 있으므로 3개 그룹이 생성됩니다. 각 그룹에 대해 뒤에 오는 집계 함수(mean, sum 등)가 적용됩니다.\r
  tips:\r
  - groupby 결과의 인덱스는 그룹 기준 컬럼 값입니다. species가 인덱스, 평균이 값인 Series가 나옵니다.\r
  snippet: penguins.groupby('species')['body_mass_g'].mean()\r
  exercise:\r
    prompt: body_mass_g 대신 flipper_length_mm로 바꿔 종별 평균 날개 길이를 구해보세요.\r
    starterCode: penguins.groupby('species')['body_mass_g'].mean()\r
    hints:\r
    - 숫자 컬럼이면 mean을 호출할 수 있습니다 - bill_length_mm, bill_depth_mm도 시도해보세요.\r
    - 결과는 Series이고 인덱스는 항상 'Adelie', 'Chinstrap', 'Gentoo' 알파벳 순입니다.\r
  check:\r
    type: contains\r
    requiredPatterns:\r
    - groupby\r
    noError: groupby + 컬럼 선택 + mean이 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과 Series의 인덱스가 3개 종을 모두 포함하고 값이 양수 평균이어야 합니다.\r
- id: step6_max\r
  title: 6단계. 다른 통계 함수\r
  structuredPrimary: true\r
  subtitle: max, min, sum, count\r
  goal: mean 외에 max/min/sum/count 같은 다른 집계 함수도 같은 패턴으로 쓸 수 있다는 사실을 확인한다.\r
  why: 한 번 외운 groupby 패턴이 모든 집계 함수에 그대로 적용됩니다. 새 함수를 만났을 때 같은 위치에 붙이면 된다는 사실이 학습 부담을 크게 줄입니다.\r
  explanation: mean() 대신 max(), min(), sum(), count() 등을 사용할 수 있습니다. max는 가장 무거운 펭귄의 체중, min은 가장 가벼운 펭귄, sum은 종별 총합, count는 결측치를 제외한 행 수입니다.\r
  tips:\r
  - count는 NaN을 제외한 개수이고 size는 NaN 포함 전체 행 수입니다. 결측치 처리 방침에 따라 다른 것을 선택하세요.\r
  snippet: penguins.groupby('species')['body_mass_g'].max()\r
  exercise:\r
    prompt: max를 min, sum, count, std로 바꿔 결과 값이 어떻게 달라지는지 비교해보세요.\r
    starterCode: penguins.groupby('species')['body_mass_g'].max()\r
    hints:\r
    - sum은 같은 종 펭귄들의 체중을 모두 더한 값이라 매우 큽니다(수십만 단위).\r
    - std는 그룹 내 체중의 표준편차로 분산 정도를 보여줍니다.\r
  check:\r
    type: noError\r
    noError: max/min/sum/count 호출이 정상 실행되어야 합니다.\r
    resultCheck: max는 mean보다 크고, min은 mean보다 작은 값이어야 합니다.\r
- id: step7_size\r
  title: 7단계. 그룹 크기\r
  structuredPrimary: true\r
  subtitle: size()로 개수\r
  goal: size()로 각 그룹의 행 수(표본 크기)를 확인한다.\r
  why: 그룹별 평균을 해석할 때 표본 수도 함께 봐야 합니다. Chinstrap 68마리의 평균은 Adelie 152마리의 평균보다 변동이 클 수 있다는 점을 알 수 있습니다.\r
  explanation: size()는 각 그룹의 행 수를 세어줍니다. value_counts와 비슷하지만 정렬되지 않고 그룹 기준 컬럼 값의 알파벳 순으로 정렬됩니다. 결측치도 행으로 셉니다.\r
  tips:\r
  - size()의 결과 합계가 전체 행 수(penguins.shape[0])와 같아야 합니다. 다르면 결측치 또는 필터링 단계의 누락이 있습니다.\r
  snippet: penguins.groupby('species').size()\r
  exercise:\r
    prompt: size() 결과의 sum()이 penguins.shape[0]과 같은지 직접 확인하세요.\r
    starterCode: penguins.groupby('species').size()\r
    hints:\r
    - size()는 Series를 반환하므로 .sum()을 바로 붙일 수 있습니다.\r
    - penguins.shape는 튜플이고 [0]이 행 수입니다.\r
  check:\r
    type: noError\r
    noError: size() 호출이 정상 실행되어 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 sum이 원본 DataFrame의 행 수와 같아야 합니다.\r
- id: step8_reset_index\r
  title: 8단계. 인덱스 복원\r
  structuredPrimary: true\r
  subtitle: reset_index()\r
  goal: groupby 결과의 인덱스를 reset_index()로 일반 컬럼으로 되돌려 DataFrame 형태로 만든다.\r
  why: 시각화나 추가 merge에서 species가 인덱스가 아니라 컬럼이어야 편한 경우가 많습니다. matplotlib의 x축 인자, sns의 hue 인자가 모두 컬럼명을 받습니다.\r
  explanation: |-\r
    groupby 결과는 기본적으로 그룹 기준 컬럼이 인덱스가 됩니다. 즉, species가 행 이름이 되어버립니다. 이 결과를 일반 DataFrame처럼 다시 컬럼으로 만들려면 reset_index()를 사용합니다. 인덱스를 컬럼으로 복원하면 추가 분석이나 시각화를 할 때 더 편리합니다. 예를 들어 그래프를 그릴 때 species를 x축으로 사용하려면 컬럼이어야 합니다. reset_index()는 인덱스를 0, 1, 2...로 초기화하고, 기존 인덱스를 새 컬럼으로 추가합니다.\r
\r
    reset_index()를 사용하지 않으면 결과가 Series 형태로 나옵니다. DataFrame으로 만들려면 reset_index()를 붙이거나, 처음부터 groupby('species')[['body_mass_g']].mean()처럼 2겹 대괄호를 사용하면 됩니다.\r
  tips:\r
  - groupby의 as_index=False 옵션도 같은 결과를 줍니다 - penguins.groupby('species', as_index=False)['body_mass_g'].mean().\r
  snippet: penguins.groupby('species')['body_mass_g'].mean().reset_index()\r
  exercise:\r
    prompt: reset_index()를 빼고 실행한 결과(Series)와 붙인 결과(DataFrame)를 비교해 type()으로 차이를 확인하세요.\r
    starterCode: penguins.groupby('species')['body_mass_g'].mean().reset_index()\r
    hints:\r
    - type(결과)로 pandas.Series인지 pandas.DataFrame인지 구분할 수 있습니다.\r
    - DataFrame은 .columns 속성이 있고, Series는 .name 속성이 있습니다.\r
  check:\r
    type: noError\r
    noError: groupby + mean + reset_index 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과가 DataFrame이고 'species'와 'body_mass_g' 두 컬럼을 포함해야 합니다.\r
- id: step9_multi_group\r
  title: 9단계. 여러 컬럼으로 그룹핑\r
  structuredPrimary: true\r
  subtitle: 종 + 성별\r
  goal: groupby(['species','sex'])로 두 컬럼 조합별 평균을 구해 교차 분석을 한다.\r
  why: 한 컬럼만으로는 보이지 않는 패턴이 두 컬럼 조합에서 드러납니다 - 같은 종 안에서도 수컷이 암컷보다 무거운 패턴은 species만으로는 안 보입니다.\r
  explanation: |-\r
    groupby는 하나의 컬럼뿐만 아니라 여러 컬럼을 동시에 기준으로 사용할 수 있습니다. 리스트 형태로 여러 컬럼을 전달하면 해당 컬럼들의 조합으로 그룹이 만들어집니다. 예를 들어 ['species', 'sex']로 그룹핑하면 (Adelie, MALE), (Adelie, FEMALE), (Gentoo, MALE), (Gentoo, FEMALE)... 이렇게 종과 성별의 모든 조합별로 그룹이 생성됩니다. 교차 분석이 필요할 때 매우 유용합니다. 같은 종 내에서도 수컷과 암컷의 체중 차이를 비교할 수 있습니다.\r
\r
    여러 컬럼으로 그룹핑하면 결과의 인덱스가 MultiIndex(다층 인덱스)가 됩니다. reset_index()로 평평하게 만들거나, as_index=False 파라미터를 추가하면 처음부터 평평한 DataFrame을 얻을 수 있습니다.\r
  tips:\r
  - MultiIndex Series는 .unstack()으로 두 번째 인덱스를 컬럼으로 펼칠 수 있습니다 - 교차표 형태가 됩니다.\r
  snippet: penguins.groupby(['species', 'sex'])['body_mass_g'].mean()\r
  exercise:\r
    prompt: groupby의 리스트를 [species, sex] 대신 [island, species]로 바꿔 섬별/종별 평균을 구해보세요.\r
    starterCode: penguins.groupby(['species', 'sex'])['body_mass_g'].mean()\r
    hints:\r
    - island 컬럼에는 'Biscoe', 'Dream', 'Torgersen' 세 값이 있습니다.\r
    - 결과 인덱스는 (island, species) 두 단계의 MultiIndex입니다.\r
  check:\r
    type: noError\r
    noError: 리스트로 그룹핑이 정상 실행되어 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 인덱스가 MultiIndex이고 두 개의 level을 가져야 합니다.\r
- id: step10_agg_list\r
  title: 10단계. 여러 통계 한번에\r
  structuredPrimary: true\r
  subtitle: agg() 리스트\r
  goal: agg(['mean','min','max'])로 한 컬럼에 여러 통계를 동시에 적용한다.\r
  why: 평균만 보면 분포의 폭을 알 수 없습니다. 같은 평균이라도 (min=2700, max=6300)과 (min=4000, max=4500)은 완전히 다른 데이터입니다.\r
  explanation: |-\r
    지금까지는 mean(), max() 같은 함수를 하나씩만 적용했습니다. 하지만 agg(aggregate, 집계) 메서드를 사용하면 여러 통계 함수를 동시에 적용할 수 있습니다. 함수 이름을 리스트로 전달하면 각 함수의 결과가 컬럼으로 나란히 출력됩니다. 예를 들어 ['mean', 'min', 'max']를 전달하면 평균, 최소, 최대값을 한 번에 볼 수 있습니다. 데이터의 전체적인 분포를 파악하는 데 매우 효율적입니다. 한 줄로 종별 체중의 평균, 최소, 최대를 모두 확인할 수 있습니다.\r
\r
    agg()에는 'mean', 'sum', 'min', 'max', 'std'(표준편차), 'count', 'median'(중앙값), 'var'(분산) 등 다양한 집계 함수를 사용할 수 있습니다. 사용자 정의 함수도 lambda나 def로 만들어 전달할 수 있습니다.\r
  tips:\r
  - agg에 lambda도 넘길 수 있습니다 - agg(['mean', lambda s: s.max() - s.min()])처럼 범위(range)를 즉석에서 정의 가능합니다.\r
  snippet: penguins.groupby('species')['body_mass_g'].agg(['mean', 'min', 'max'])\r
  exercise:\r
    prompt: 리스트에 'std', 'median'을 추가해 표준편차와 중앙값까지 한 번에 보세요.\r
    starterCode: penguins.groupby('species')['body_mass_g'].agg(['mean', 'min', 'max'])\r
    hints:\r
    - std가 클수록 그룹 내 체중 편차가 큽니다 - Gentoo가 std가 가장 큰 종입니다.\r
    - median과 mean이 차이가 크면 분포가 한쪽으로 치우쳐 있다는 신호입니다.\r
  check:\r
    type: contains\r
    requiredPatterns:\r
    - agg\r
    noError: agg에 리스트를 넘기는 호출이 정상 실행되어야 합니다.\r
    resultCheck: 결과 DataFrame의 컬럼이 리스트에 넣은 함수 이름과 같아야 합니다.\r
- id: step11_agg_dict\r
  title: 11단계. 컬럼별 다른 함수\r
  structuredPrimary: true\r
  subtitle: agg() 딕셔너리\r
  goal: agg에 dict를 넘기는 형태로 컬럼마다 다른 집계 함수를 적용해 리포트를 만든다.\r
  why: 실무 리포트는 "체중은 평균, 부리는 최대, 표본 수는 size"처럼 컬럼마다 다른 통계가 필요합니다. dict 형태가 이를 한 줄로 표현해줍니다.\r
  explanation: |-\r
    agg()의 진정한 강력함은 컬럼마다 다른 집계 함수를 적용할 수 있다는 것입니다. 딕셔너리 형태로 {'컬럼명': '함수'} 또는 {'컬럼명': ['함수1', '함수2']}처럼 작성하면 됩니다. 예를 들어 체중은 평균을 보고 싶고, 부리 길이는 최대값을 보고 싶다면 각각 다른 함수를 지정할 수 있습니다. 각 컬럼의 특성에 맞는 통계량을 선택적으로 계산할 수 있어 매우 유연합니다. 실무에서 리포트를 만들 때 자주 사용하는 패턴입니다.\r
\r
    딕셔너리의 값으로 리스트를 주면 한 컬럼에 여러 함수를 적용할 수 있습니다. 예: {'body_mass_g': ['mean', 'std'], 'bill_length_mm': 'max'}처럼 작성하면 체중은 평균과 표준편차, 부리는 최대값을 계산합니다.\r
  tips:\r
  - pandas 0.25+ 에서는 named aggregation도 가능합니다 - agg(avg_mass=('body_mass_g','mean'))처럼 결과 컬럼 이름을 직접 지정할 수 있습니다.\r
  snippet: |-\r
    penguins.groupby('species').agg({\r
        'body_mass_g': 'mean',\r
        'bill_length_mm': 'max'\r
    })\r
  exercise:\r
    prompt: dict에 flipper_length_mm 키와 min 값을 추가하거나 body_mass_g 값에 [mean, std] 리스트를 줘서 여러 함수가 한 컬럼에 적용되는 형태를 시도하세요.\r
    starterCode: |-\r
      penguins.groupby('species').agg({\r
          'body_mass_g': 'mean',\r
          'bill_length_mm': 'max'\r
      })\r
    hints:\r
    - 한 컬럼에 리스트를 주면 결과 DataFrame의 컬럼이 MultiIndex가 됩니다.\r
    - dict 키는 원본 컬럼명과 정확히 일치해야 합니다.\r
  check:\r
    type: contains\r
    requiredPatterns:\r
    - agg\r
    noError: agg에 dict를 넘기는 호출이 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과 DataFrame의 컬럼이 dict 키와 같고, 각 셀이 지정한 함수의 계산 결과여야 합니다.\r
- id: step12_query\r
  title: 12단계. query 필터링\r
  structuredPrimary: true\r
  subtitle: 간결한 조건문\r
  goal: query('body_mass_g > 5000')으로 SQL WHERE 스타일 필터링을 사용한다.\r
  why: df[df['col'] > 5000]에서 df를 두 번 쓰는 어색함이 사라집니다. 조건이 길수록 query 쪽이 훨씬 읽기 쉽습니다.\r
  explanation: |-\r
    query() 메서드는 기존의 DataFrame[조건] 방식보다 더 간결하고 읽기 쉬운 필터링을 제공합니다. 조건을 문자열로 작성하기 때문에 대괄호 중첩이 줄어들고, SQL의 WHERE 절처럼 직관적입니다. penguins[penguins['body_mass_g'] > 5000] 대신 penguins.query('body_mass_g > 5000')처럼 작성할 수 있습니다. 컬럼명을 따옴표로 감싸지 않아도 되고, 복잡한 조건을 and, or로 연결할 때 특히 편리합니다.\r
\r
    query()는 내부적으로 문자열을 파싱해서 조건을 평가합니다. 비교 연산자(>, <, ==, !=)뿐만 아니라 and, or, not 같은 논리 연산자도 사용할 수 있습니다. 예: query('body_mass_g > 4000 and sex == "MALE"')\r
  tips:\r
  - query 문자열 안에서 외부 변수를 쓰려면 @ 접두사를 붙입니다 - threshold = 5000; query('body_mass_g > @threshold').\r
  snippet: penguins.query('body_mass_g > 5000')\r
  exercise:\r
    prompt: 조건을 '4500 < body_mass_g < 5500'처럼 범위 형태로 바꿔 chained comparison을 시도하세요.\r
    starterCode: penguins.query('body_mass_g > 5000')\r
    hints:\r
    - query는 파이썬 chained comparison(a < x < b)을 지원합니다 - DataFrame[] 방식보다 자연스럽습니다.\r
    - 결과 shape의 행 수가 조건에 맞는 행 수와 같아야 합니다.\r
  check:\r
    type: contains\r
    requiredPatterns:\r
    - query\r
    noError: query 호출이 SyntaxError 없이 실행되고 DataFrame을 반환해야 합니다.\r
    resultCheck: 결과 DataFrame의 모든 body_mass_g 값이 조건을 만족해야 합니다.\r
- id: step13_query_string\r
  title: 13단계. query 문자열 조건\r
  structuredPrimary: true\r
  subtitle: 따옴표 사용법\r
  goal: query 안에서 문자열 비교 시 따옴표 중첩을 안전하게 사용하는 방법을 익힌다.\r
  why: query('species == "Gentoo"')의 작은따옴표/큰따옴표 조합 규칙을 한 번 외우지 않으면 매번 SyntaxError가 납니다.\r
  explanation: |-\r
    query()에서 문자열 값을 비교할 때는 따옴표 중첩에 주의해야 합니다. query 전체를 작은따옴표로 감싸고, 비교할 문자열 값은 큰따옴표로 감싸는 것이 일반적입니다. 즉, query('species == "Gentoo"') 형태입니다. 반대로 바깥을 큰따옴표, 안을 작은따옴표로 해도 되지만, 파이썬에서는 바깥 작은따옴표가 관례입니다. 이렇게 하면 문자열 비교 조건을 명확하게 작성할 수 있습니다.\r
\r
    query() 안에서 여러 조건을 연결할 때: query('species == "Gentoo" and body_mass_g > 5000')처럼 and로 연결하거나, query('sex == "MALE" or sex == "FEMALE"')처럼 or를 사용할 수 있습니다. &, |도 가능하지만 and, or가 더 읽기 쉽습니다.\r
  tips:\r
  - 리스트 멤버십은 species in ["Gentoo","Adelie"] 형태로 query 안에서 그대로 작동합니다.\r
  snippet: penguins.query('species == "Gentoo"')\r
  exercise:\r
    prompt: 조건을 'species == "Gentoo" and body_mass_g > 5500'처럼 두 조건의 and로 바꿔보세요.\r
    starterCode: penguins.query('species == "Gentoo"')\r
    hints:\r
    - and로 연결하면 두 조건 모두 참인 행만 남습니다.\r
    - 결과 shape의 행 수가 줄어드는지 확인하세요.\r
  check:\r
    type: contains\r
    requiredPatterns:\r
    - query\r
    noError: 문자열 비교 query가 SyntaxError 없이 실행되어야 합니다.\r
    resultCheck: 결과 DataFrame의 species 컬럼 값이 모두 'Gentoo'여야 합니다.\r
- id: step14_filter_groupby\r
  title: 14단계. 필터링 + 그룹핑\r
  structuredPrimary: true\r
  subtitle: 조합해서 분석\r
  goal: query 결과에 바로 groupby를 체이닝해 "특정 조건의 그룹별 통계"를 한 줄에 만든다.\r
  why: query → groupby 체인이 실무 분석의 가장 흔한 패턴입니다. 여성 펭귄만의 종별 평균, MALE만의 섬별 평균 같은 슬라이스 분석이 모두 이 형태입니다.\r
  explanation: 필터링과 그룹핑을 조합하면 더 정교한 분석이 가능합니다. query가 DataFrame을 반환하므로 그 결과에 .groupby를 그대로 이어붙일 수 있습니다. 메서드 체이닝의 강점이 가장 잘 드러나는 패턴입니다.\r
  tips:\r
  - 체인이 길어지면 줄 끝에 백슬래시(\\)를 넣거나 전체를 괄호로 감싸 여러 줄로 나눌 수 있습니다.\r
  snippet: penguins.query('sex == "FEMALE"').groupby('species')['body_mass_g'].mean()\r
  exercise:\r
    prompt: FEMALE을 MALE로 바꿔 종별 평균을 비교하고 어느 성별이 무거운지 확인하세요.\r
    starterCode: penguins.query('sex == "FEMALE"').groupby('species')['body_mass_g'].mean()\r
    hints:\r
    - 펭귄은 일반적으로 수컷이 암컷보다 큽니다.\r
    - 두 결과를 변수에 저장해 차이(maleMeans - femaleMeans)를 계산해볼 수도 있습니다.\r
  check:\r
    type: contains\r
    requiredPatterns:\r
    - query\r
    - groupby\r
    noError: query + groupby + 컬럼 + mean 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과 Series의 인덱스가 species의 고유 값을 포함해야 합니다.\r
- id: step15_idxmax\r
  title: 15단계. 최대값 위치 찾기\r
  structuredPrimary: true\r
  subtitle: idxmax() 활용\r
  goal: idxmax()로 최대값을 가진 행 번호를 얻고 .loc과 조합해 그 행 전체를 본다.\r
  why: max()는 값만 주지만 idxmax + loc 조합은 "가장 무거운 펭귄이 누구인지" 컨텍스트 전체를 가져옵니다. 극값 케이스 분석의 표준 패턴입니다.\r
  explanation: |-\r
    max()는 최대값 자체를 반환하지만, idxmax()는 최대값이 위치한 인덱스(행 번호)를 반환합니다. 이 인덱스를 loc과 함께 사용하면 최대값을 가진 행 전체를 가져올 수 있습니다. 예를 들어 가장 무거운 펭귄의 체중뿐만 아니라 그 펭귄의 종, 성별, 부리 길이 등 모든 정보를 확인할 수 있습니다. 데이터에서 극값(최대/최소)을 가진 케이스의 전체 정보를 파악할 때 매우 유용한 패턴입니다. 반대로 idxmin()은 최소값의 위치를 찾습니다.\r
\r
    idxmax()와 idxmin()은 결측치(NaN)가 있으면 무시하고 계산합니다. 만약 결측치가 있는 행도 고려하려면 skipna=False 파라미터를 추가하면 됩니다. 예: penguins['body_mass_g'].idxmax(skipna=False)\r
  tips:\r
  - groupby와 함께 쓰면 더 강력합니다 - penguins.loc[penguins.groupby('species')['body_mass_g'].idxmax()]는 종별 최대 체중 행을 모두 가져옵니다.\r
  snippet: |-\r
    maxIdx = penguins['body_mass_g'].idxmax()\r
    penguins.loc[maxIdx]\r
  exercise:\r
    prompt: idxmax를 idxmin으로 바꾸거나 'body_mass_g' 대신 'flipper_length_mm'로 바꿔 다른 극값 행을 찾아보세요.\r
    starterCode: |-\r
      maxIdx = penguins['body_mass_g'].idxmax()\r
      penguins.loc[maxIdx]\r
    hints:\r
    - idxmin은 가장 작은 값의 행 번호를 반환합니다.\r
    - .loc[정수]는 단일 행을 Series로 반환합니다.\r
  check:\r
    type: noError\r
    noError: idxmax + loc 호출이 정상 실행되어야 합니다.\r
    resultCheck: 결과가 Series이고 body_mass_g 값이 컬럼 전체 max와 같아야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 종별 펭귄 특성 리포트'\r
  structuredPrimary: true\r
  subtitle: query, groupby, agg, idxmax, 실패 케이스\r
  goal: 합성 4행 DataFrame으로 query/groupby+agg/idxmax 세 결과를 assert로 동시에 고정한다.\r
  why: 평균만 보고 끝내면 약합니다. 필터링된 행, 그룹 집계, 극값 행이 모두 기대와 정확히 일치해야 리포트로 신뢰할 수 있습니다.\r
  explanation: |-\r
    그룹 비교는 평균만 보고 끝내면 약합니다. 필터링 조건, 그룹별 표본 수, 극값 행이 모두 기대와 맞는지 확인해야 리포트로 쓸 수 있습니다.\r
\r
    변주 실험: 성별까지 groupby에 포함해 species, sex 조합별 평균을 만들고, 표본 수가 1개인 그룹을 리포트에서 제외할지 정책을 정하세요.\r
  tips:\r
  - 합성 4행 DataFrame은 정답을 알고 있으므로 assert로 결과를 100% 고정할 수 있습니다 - 회귀 테스트의 패턴입니다.\r
  - named aggregation(count=('body_mass_g','size'))은 결과 컬럼 이름을 미리 정해 리포트 형태로 바로 사용 가능합니다.\r
  snippet: |-\r
    import pandas as pd\r
\r
    penguins = pd.DataFrame({\r
        "species": ["Adelie", "Adelie", "Gentoo", "Gentoo"],\r
        "sex": ["FEMALE", "MALE", "FEMALE", "MALE"],\r
        "body_mass_g": [3200, 3600, 4700, 5200],\r
    })\r
\r
    female = penguins.query('sex == "FEMALE"')\r
    report = penguins.groupby("species").agg(\r
        count=("body_mass_g", "size"),\r
        avgMass=("body_mass_g", "mean"),\r
    )\r
    maxRow = penguins.loc[penguins["body_mass_g"].idxmax()]\r
\r
    assert female["body_mass_g"].tolist() == [3200, 4700]\r
    assert report.loc["Gentoo", "avgMass"] == 4950\r
    assert maxRow["species"] == "Gentoo"\r
  exercise:\r
    prompt: body_mass_g 값을 바꾸고 어떤 assert가 깨지는지 확인한 뒤 assert 우변을 새 값으로 갱신하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      penguins = pd.DataFrame({\r
          "species": ["Adelie", "Adelie", "Gentoo", "Gentoo"],\r
          "sex": ["FEMALE", "MALE", "FEMALE", "MALE"],\r
          "body_mass_g": [3200, 3600, 4700, 5200],\r
      })\r
\r
      female = penguins.query('sex == "FEMALE"')\r
      report = penguins.groupby("species").agg(\r
          count=("body_mass_g", "size"),\r
          avgMass=("body_mass_g", "mean"),\r
      )\r
      maxRow = penguins.loc[penguins["body_mass_g"].idxmax()]\r
\r
      assert female["body_mass_g"].tolist() == [3200, 4700]\r
      assert report.loc["Gentoo", "avgMass"] == 4950\r
      assert maxRow["species"] == "Gentoo"\r
    hints:\r
    - female 결과는 sex == FEMALE인 1번째와 3번째 행입니다.\r
    - avgMass 4950은 (4700 + 5200) / 2 = 4950에서 나옵니다.\r
  check:\r
    type: noError\r
    noError: query/groupby/idxmax 세 호출이 모두 정상 실행되어야 합니다.\r
    resultCheck: 세 assert 모두 통과해야 하며, 데이터 값을 바꾸면 그에 맞춰 assert도 갱신되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 펭귄 종 비교 프로젝트\r
  goal: 펭귄 데이터를 직접 불러와 자신만의 종별 비교 분석을 시도한다.\r
  why: 가이드 따라가는 학습과 빈 종이에서 분석을 시작하는 학습은 완전히 다릅니다. 직접 가설을 세우고 groupby/query를 조합해봐야 손에 익습니다.\r
  explanation: |-\r
    펭귄 연구원이 되어 종별 특성을 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  tips:\r
  - "분석 시작 전 가설을 한 문장으로 적어보세요 - 예: '수컷 펭귄은 모든 종에서 암컷보다 부리가 길 것이다'."\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset("penguins")\r
  exercise:\r
    prompt: data를 불러와 종별 평균 부리 깊이(bill_depth_mm)를 구하고 가장 작은 종을 찾아보세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset("penguins")\r
    hints:\r
    - groupby('species')['bill_depth_mm'].mean()으로 시작하세요.\r
    - idxmin()을 붙이면 가장 작은 평균의 종 이름을 바로 얻을 수 있습니다.\r
  check:\r
    type: noError\r
    noError: loadLocalDataset 호출과 그 뒤 분석 코드가 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 최종 결과가 species 중 하나의 이름이거나 그룹별 통계 Series여야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: groupby의 핵심 개념을 배웠습니다. 반복적인 필터링 없이 그룹별 통계를 한 번에 계산하고, agg로 여러 함수를 조합하며, query로 간결한 필터링을 수행하는\r
      방법을 익혔습니다. 이 기술들은 실무 데이터 분석에서 필수적인 스킬입니다.\r
  - type: list\r
    items:\r
    - df.groupby('컬럼').mean() - 그룹별 평균 (Split-Apply-Combine)\r
    - df.groupby('컬럼').size() - 그룹별 개수\r
    - df.groupby(['컬럼1', '컬럼2']) - 여러 컬럼으로 그룹핑 (교차 분석)\r
    - df.groupby('컬럼').agg(['mean', 'max']) - 여러 통계 한번에\r
    - 'df.groupby(''컬럼'').agg({''컬럼1'': ''mean'', ''컬럼2'': ''max''}) - 컬럼별 다른 함수'\r
    - .reset_index() - 인덱스를 컬럼으로 복원\r
    - df.query('조건') - 간결한 필터링 (SQL WHERE 스타일)\r
    - df['컬럼'].idxmax() - 최대값 위치 찾기\r
  - type: text\r
    content: 다음 시간에는 붓꽃 데이터로 결측치 처리와 새 컬럼 만들기를 배웁니다. assign, apply, map 등 데이터 변환 기술을 익힙니다.\r
  goal: 이 강의에서 익힌 groupby/agg/query 8가지 패턴을 머릿속에 정리한다.\r
  why: 같은 패턴이 다음 강의(붓꽃 결측치 처리)와 다음다음 강의(자동차 연비)에서 그대로 반복됩니다. 한 번에 정리해두면 다음 강의를 빠르게 따라갈 수 있습니다.\r
`;export{e as default};