var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_02\r
  title: 타이타닉생존분석\r
  order: 2\r
  category: pandas\r
  difficulty: ⭐⭐\r
  badge: 입문\r
  dataSource: codaro-local:titanic\r
  tags:\r
  - titanic\r
  - 필터링\r
  - loc\r
  - iloc\r
  - value_counts\r
  - 검증\r
  - 생존분석\r
  seo:\r
    title: pandas 타이타닉 생존분석 - 조건 필터링, loc, iloc\r
    description: 타이타닉 데이터로 조건 필터링을 배웁니다. 생존자/사망자 필터링, value_counts, loc/iloc으로 데이터 선택하는 방법을 실습합니다.\r
    keywords:\r
    - pandas 필터링\r
    - loc iloc\r
    - value_counts\r
    - 타이타닉 데이터\r
    - 조건 선택\r
intro:\r
  emoji: 🚢\r
  goal: 타이타닉 승객 데이터에서 "누가 생존했는가?"를 분석합니다.\r
  description: 조건 필터링을 배웁니다. "생존자만", "1등석만"처럼 원하는 데이터만 골라내는 방법을 익힙니다.\r
  direction: 타이타닉 180명 로컬 승객 샘플로 Boolean Indexing + value_counts + loc/iloc을 손에 익혀 "필터링 → 집계 → 위치 기반 선택" 흐름을 완성합니다.\r
  benefits:\r
  - DataFrame에서 단일 컬럼/다중 컬럼 선택 패턴을 명확히 구분합니다.\r
  - Boolean Series(== 비교)와 Boolean Indexing(df[조건])의 관계를 코드로 확인합니다.\r
  - value_counts로 분포를 빠르게 보고 normalize로 비율로 전환합니다.\r
  - loc(레이블 기반)과 iloc(위치 기반) 두 인덱서의 사용 시점을 분명히 합니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로드 + shape\r
      detail: loadLocalDataset(titanic)으로 180행 DataFrame을 만든다.\r
    - label: 2단계. 컬럼 선택과 조건식\r
      detail: 단일/다중 컬럼 + Boolean Series로 필터링 기반을 다진다.\r
    - label: 3단계. 필터링 + 통계 조합\r
      detail: 1등석 생존율, 여성 생존율을 계산해 가설을 데이터로 확인한다.\r
    - label: 4단계. loc/iloc + workflow 검증\r
      detail: 두 인덱서 차이를 비교하고 합성 4행으로 assert 4개를 고정한다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 타이타닉생존분석 실행\r
      detail: 셀을 실행해 필터링 행 수, 생존율, loc/iloc 결과와 예외 상태를 확인합니다.\r
    - label: 타이타닉생존분석 완료\r
      detail: 검증된 필터링 코드를 생존 요인 리포트 자동화로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 타이타닉 승객 데이터\r
  goal: loadLocalDataset로 titanic DataFrame을 불러오고 shape으로 행/열 수를 확인한다.\r
  why: 데이터 분석의 첫 단계입니다. 180명이라는 전체 표본 크기를 알아야 이후 1등석/여성 같은 그룹 비율을 해석할 수 있습니다.\r
  explanation: 타이타닉 데이터셋은 1912년 4월 15일 침몰한 타이타닉호 승객 구조를 본뜬 180명의 로컬 샘플 정보를 담고 있습니다. 이 데이터는 데이터 분석 교육에서 가장 널리 사용되는 클래식\r
    데이터셋으로, 실제 역사적 사건을 바탕으로 생존 요인을 분석할 수 있습니다. 15개의 컬럼에는 승객의 나이, 성별, 객실 등급, 운임, 가족 관계 등 다양한 정보가 포함되어 있습니다.\r
    survived 컬럼이 1이면 생존, 0이면 사망을 의미하며, 이번 분석의 핵심 타겟 변수입니다. 로컬 실행에서는 네트워크가 없어도 필터링 흐름을 연습할 수 있도록 핵심 컬럼을\r
    가진 샘플 데이터를 함께 사용합니다.\r
  tips:\r
  - survived 컬럼이 분석의 타겟입니다. 0/1 이진 변수라는 점을 기억해두면 평균이 곧 생존율이라는 트릭을 쓸 수 있습니다.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    titanic = loadLocalDataset("titanic")\r
    titanic.shape\r
  exercise:\r
    prompt: shape 대신 columns나 dtypes를 호출해 컬럼 이름과 타입을 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      titanic = loadLocalDataset("titanic")\r
      titanic.shape\r
    hints:\r
    - dtypes는 각 컬럼의 NumPy 타입을 Series로 반환합니다.\r
    - 숫자 컬럼은 int64 또는 float64, 문자열 컬럼은 object입니다.\r
  check:\r
    type: noError\r
    noError: loadLocalDataset과 shape 호출이 정상 실행되어야 합니다.\r
    resultCheck: shape 결과가 (891, n) 형태의 튜플이거나 그에 준해야 합니다.\r
- id: step2_head\r
  title: 2단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: head()로 구조 파악\r
  goal: head()로 앞 몇 행을 보고 컬럼명(pclass/sex/age/fare 등)이 무엇을 뜻하는지 익힌다.\r
  why: 필터링 조건을 쓸 때 컬럼 이름과 값의 형식(숫자인지 문자열인지)을 알아야 == 비교를 올바르게 작성할 수 있습니다.\r
  explanation: head() 메서드로 데이터의 처음 몇 행을 미리 확인합니다. 이 단계에서 각 컬럼의 데이터 타입과 실제 값들이 어떻게 저장되어 있는지 파악할 수 있습니다.\r
    pclass는 객실 등급(1등석, 2등석, 3등석), sex는 성별, age는 나이, sibsp는 함께 탑승한 형제자매/배우자 수, parch는 부모/자녀 수, fare는 운임,\r
    embarked는 탑승 항구를 의미합니다. 데이터를 분석하기 전에 전체적인 구조를 이해하는 것이 매우 중요합니다.\r
  tips:\r
  - sex 컬럼은 문자열 (female/male), pclass는 정수 (1/2/3)임을 미리 확인해두면 필터링 조건의 따옴표 사용을 헷갈리지 않습니다.\r
  snippet: titanic.head()\r
  exercise:\r
    prompt: head()를 head(10)으로 바꾸거나 tail()을 호출해 다른 행을 미리 보세요.\r
    starterCode: titanic.head()\r
    hints:\r
    - head(n)은 처음 n행, tail(n)은 마지막 n행을 반환합니다.\r
    - 인자를 주지 않으면 기본 5행입니다.\r
  check:\r
    type: noError\r
    noError: head() 호출이 정상 실행되어야 합니다.\r
    resultCheck: 결과 DataFrame이 원본 컬럼을 모두 포함하고 행 수가 5(또는 호출 인자)여야 합니다.\r
- id: step3_single\r
  title: 3단계. 컬럼 하나 선택\r
  structuredPrimary: true\r
  subtitle: 대괄호 사용\r
  goal: 대괄호 한 겹으로 단일 컬럼을 선택하면 Series가 반환되는 것을 확인한다.\r
  why: pandas의 모든 분석은 Series 또는 DataFrame을 다룹니다. 단일 컬럼 선택이 Series를 만든다는 사실은 이후 sum/mean/value_counts 호출의 기본입니다.\r
  explanation: |-\r
    DataFrame에서 특정 컬럼 하나만 선택하려면 대괄호를 사용합니다. 대괄호 안에 컬럼명을 문자열로 입력하면 해당 컬럼의 모든 값을 Series 형태로 가져올 수 있습니다. 여기서는 생존 여부를 나타내는 survived 컬럼을 선택합니다. 이 컬럼은 이진 변수로, 0과 1 두 가지 값만 가지며 생존자 분석의 핵심 변수입니다.\r
\r
    DataFrame 대괄호로 단일 컬럼명을 선택하면 Series를 반환합니다. Series는 pandas의 1차원 데이터 구조로, 하나의 열을 나타냅니다. 컬럼명은 반드시 따옴표로 감싸야 하며, 대소문자를 정확히 구분해야 합니다.\r
  tips:\r
  - titanic.survived처럼 점 표기법도 동작하지만, 컬럼명에 공백이나 예약어가 있으면 깨집니다. 대괄호 표기법이 안전합니다.\r
  snippet: titanic['survived']\r
  exercise:\r
    prompt: survived 대신 sex나 age 컬럼을 선택해 결과 Series의 dtype을 확인하세요.\r
    starterCode: titanic['survived']\r
    hints:\r
    - sex는 object(문자열), age는 float64(결측치 포함 가능)일 것입니다.\r
    - 결과에 .dtype을 붙이면 타입을 확인할 수 있습니다.\r
  check:\r
    type: noError\r
    noError: 단일 컬럼 선택이 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 Series이고 길이가 891 또는 그에 준해야 합니다.\r
- id: step4_multi\r
  title: 4단계. 컬럼 여러 개 선택\r
  structuredPrimary: true\r
  subtitle: 대괄호 2겹\r
  goal: 대괄호 두 겹으로 여러 컬럼을 선택하면 DataFrame이 반환된다는 점을 확인한다.\r
  why: 단일 컬럼은 Series, 다중 컬럼은 DataFrame. 이 두 결과를 혼동하면 그 뒤 메서드 호출이 깨집니다. 두 겹 대괄호의 의미를 처음에 분명히 해둡니다.\r
  explanation: |-\r
    여러 컬럼을 동시에 선택하려면 대괄호를 2겹으로 사용합니다. 바깥 대괄호는 DataFrame 선택을 의미하고, 안쪽 대괄호는 컬럼명 리스트를 의미합니다. 결과는 Series가 아닌 DataFrame으로 반환되며, 선택한 컬럼들만 포함하는 새로운 표를 만듭니다. 분석에 필요한 핵심 컬럼만 추출해서 보기 쉽게 만들 수 있습니다.\r
\r
    대괄호 1겹과 2겹의 차이가 핵심입니다. titanic 대괄호 single은 Series를 반환하고, titanic 대괄호 double은 DataFrame을 반환합니다. 여러 컬럼을 선택할 때는 반드시 2겹으로 작성해야 합니다.\r
  tips:\r
  - 한 컬럼만 선택하더라도 titanic 대괄호 double로 쓰면 DataFrame 형태를 유지할 수 있습니다 - 시각화 라이브러리는 보통 DataFrame을 요구합니다.\r
  snippet: titanic[['survived', 'pclass', 'sex', 'age']]\r
  exercise:\r
    prompt: 리스트의 컬럼 수를 2개로 줄이거나 fare를 추가해 결과 컬럼 수가 어떻게 달라지는지 확인하세요.\r
    starterCode: titanic[['survived', 'pclass', 'sex', 'age']]\r
    hints:\r
    - 결과 DataFrame의 .columns 길이가 리스트의 길이와 같아야 합니다.\r
    - 존재하지 않는 컬럼명을 넣으면 KeyError가 발생합니다.\r
  check:\r
    type: noError\r
    noError: 다중 컬럼 선택이 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 DataFrame이고 컬럼 수가 리스트 길이와 같아야 합니다.\r
- id: step5_condition\r
  title: 5단계. 조건 만들기\r
  structuredPrimary: true\r
  subtitle: == 비교 연산자\r
  goal: == 연산자로 Boolean Series(True/False 배열)를 만든다.\r
  why: 필터링의 첫 절반은 Boolean Series입니다. 이 단계 없이 6단계의 df 대괄호 조건이 어떻게 동작하는지 이해할 수 없습니다.\r
  explanation: |-\r
    데이터 필터링의 핵심은 조건식을 만드는 것입니다. ==는 같은지를 확인하는 비교 연산자로, 각 값이 조건을 만족하면 True, 만족하지 않으면 False를 반환합니다. titanic survived ==1은 각 승객이 생존했는지 확인하는 조건식입니다. 결과는 180개의 True/False 값으로 이루어진 Boolean Series가 됩니다. 이 Boolean Series를 다음 단계에서 필터링에 사용합니다.\r
\r
    비교 연산자는 ==, !=, >, <, >=, <= 등이 있습니다. 할당의 =과 비교의 ==를 구분해야 합니다. x = 5는 값을 대입하고, x == 5는 같은지 비교합니다.\r
  tips:\r
  - Boolean Series의 sum()은 True의 개수를 줍니다 - (titanic 컬럼 == 값).sum()이 곧 조건을 만족하는 행 수입니다.\r
  snippet: titanic['survived'] == 1\r
  exercise:\r
    prompt: == 1을 != 1이나 == 0으로 바꿔 결과 Boolean Series가 뒤집히는지 확인하세요.\r
    starterCode: titanic['survived'] == 1\r
    hints:\r
    - 부등호 연산자(!=)는 다르다는 뜻이고 ==와 정확히 반대 결과를 줍니다.\r
    - sum()을 붙이면 True 개수를 셀 수 있습니다.\r
  check:\r
    type: noError\r
    noError: 비교 연산이 정상 실행되어 Boolean Series를 반환해야 합니다.\r
    resultCheck: 결과가 Series이고 dtype이 bool이어야 합니다.\r
- id: step6_filter\r
  title: 6단계. 생존자 필터링\r
  structuredPrimary: true\r
  subtitle: 조건이 True인 행만\r
  goal: df 대괄호 조건 형태(Boolean Indexing)로 생존자 99명만 추출한다.\r
  why: Boolean Series와 Boolean Indexing이 결합되는 핵심 단계입니다. 이 패턴이 모든 pandas 필터링의 기본입니다.\r
  explanation: |-\r
    이제 조건식을 DataFrame의 대괄호 안에 넣어서 실제 필터링을 수행합니다. df 대괄호 조건식 형태로 작성하면 조건이 True인 행만 선택되고, False인 행은 자동으로 제외됩니다. 이를 Boolean Indexing이라고 부릅니다. len 함수로 개수를 세어보면 180명 중 99명이 생존한 것을 확인할 수 있습니다. 생존율은 55%입니다.\r
\r
    필터링 결과를 새 변수에 저장하면 추가 분석을 할 수 있습니다. len은 행의 개수를 세는 함수입니다. .shape[0]이나 .count()를 사용해도 같은 결과를 얻을 수 있습니다.\r
  tips:\r
  - 생존자 수 / 전체 수가 곧 생존율입니다 - 99 / 180 = 0.55.\r
  snippet: |-\r
    survivors = titanic[titanic['survived'] == 1]\r
    len(survivors)\r
  exercise:\r
    prompt: == 1 대신 == 0으로 바꿔 사망자 수를 구하고 180 - 생존자 수와 같은지 확인하세요.\r
    starterCode: |-\r
      survivors = titanic[titanic['survived'] == 1]\r
      len(survivors)\r
    hints:\r
    - 생존자 수 + 사망자 수가 전체 행 수와 같아야 합니다.\r
    - 결측이 있으면 합이 전체보다 작을 수 있습니다.\r
  check:\r
    type: noError\r
    noError: Boolean Indexing이 KeyError 없이 실행되어야 합니다.\r
    resultCheck: len(survivors)가 0보다 큰 정수여야 합니다.\r
- id: step7_firstclass\r
  title: 7단계. 1등석 필터링\r
  structuredPrimary: true\r
  subtitle: 다른 조건 적용\r
  goal: pclass == 1 조건으로 1등석 승객 216명을 추출해 같은 패턴을 다른 컬럼에 적용한다.\r
  why: 한 번 익힌 Boolean Indexing 패턴이 모든 컬럼에 동일하게 적용된다는 점을 손에 익힙니다.\r
  explanation: 같은 방식으로 다른 조건을 적용해봅니다. pclass(passenger class)는 객실 등급을 나타내며, 1이 1등석, 2가 2등석, 3이 3등석입니다.\r
    타이타닉에서는 객실 등급이 생존에 큰 영향을 미쳤는데, 상류층이 탑승한 1등석은 구명보트 접근이 용이했기 때문입니다. 1등석 승객은 216명이었습니다.\r
  tips:\r
  - pclass는 정수이므로 == 1로 비교합니다. sex처럼 문자열이면 == "female"로 따옴표가 필요합니다.\r
  snippet: |-\r
    first = titanic[titanic['pclass'] == 1]\r
    len(first)\r
  exercise:\r
    prompt: pclass == 1을 pclass == 3으로 바꿔 3등석 승객 수를 구하고 1등석보다 훨씬 많다는 점을 확인하세요.\r
    starterCode: |-\r
      first = titanic[titanic['pclass'] == 1]\r
      len(first)\r
    hints:\r
    - 3등석은 약 491명으로 가장 많습니다.\r
    - 1등석 + 2등석 + 3등석이 180이 되어야 합니다.\r
  check:\r
    type: noError\r
    noError: Boolean Indexing이 정상 실행되어야 합니다.\r
    resultCheck: len(first)가 0과 891 사이의 정수여야 합니다.\r
- id: step8_value_counts\r
  title: 8단계. 값별 개수\r
  structuredPrimary: true\r
  subtitle: value_counts()\r
  goal: value_counts로 컬럼의 모든 고유 값마다 등장 횟수를 한 줄에 본다.\r
  why: 매번 ==로 필터링하고 len 호출하는 대신, value_counts 한 줄이면 분포 전체가 나옵니다.\r
  explanation: |-\r
    value_counts 메서드는 범주형 데이터의 각 값이 몇 번 등장하는지 자동으로 세어줍니다. 일일이 필터링해서 개수를 셀 필요 없이 한 줄로 전체 분포를 파악할 수 있어 매우 편리합니다. 기본적으로 개수가 많은 순서대로 정렬되어 출력됩니다. 로컬 타이타닉 샘플에서는 81명이 사망(0), 99명이 생존(1)했습니다. 생존자가 사망자보다 조금 많습니다.\r
\r
    value_counts는 기본적으로 결측치(NaN)를 제외합니다. 결측치도 포함하려면 dropna=False를 추가하면 됩니다. 또한 sort=False를 추가하면 정렬하지 않고 원래 순서대로 보여줍니다.\r
  tips:\r
  - value_counts의 결과 인덱스가 고유 값이고 값이 빈도수입니다. 결과에 .index.tolist()를 붙이면 모든 고유 값을 리스트로 받을 수 있습니다.\r
  snippet: titanic['survived'].value_counts()\r
  exercise:\r
    prompt: survived 대신 pclass나 sex 컬럼으로 바꿔 등급별/성별 분포를 확인하세요.\r
    starterCode: titanic['survived'].value_counts()\r
    hints:\r
    - pclass는 3개 고유 값, sex는 2개 고유 값을 가집니다.\r
    - 결과의 sum()이 결측치 제외 전체 행 수와 같아야 합니다.\r
  check:\r
    type: noError\r
    noError: value_counts가 정상 실행되어 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 값이 모두 정수 빈도여야 합니다.\r
- id: step8_5_describe\r
  title: 8.5단계. 숫자 통계 복습\r
  structuredPrimary: true\r
  subtitle: describe()로 전체 파악\r
  goal: describe()로 숫자 컬럼들의 평균/표준편차/사분위수를 한 번에 본다.\r
  why: 필터링으로 부분을 보기 전, 전체의 통계를 알아야 부분 통계가 평균보다 높은지 낮은지를 판단할 수 있습니다.\r
  explanation: |-\r
    이전 프로젝트(01번)에서 배운 describe()를 복습합니다. 숫자 컬럼들의 평균, 표준편차, 최소/최대값 등을 한눈에 확인할 수 있습니다. 나이(age)는 평균 약 30세, 운임(fare)은 평균 약 $32, 최대 운임은 $512입니다. describe()는 데이터를 처음 볼 때 전체적인 분포를 빠르게 파악하는 데 매우 유용합니다.\r
\r
    describe()는 01번 프로젝트에서 처음 배운 메서드입니다. count(개수), mean(평균), std(표준편차), min(최소), 25%(1사분위), 50%(중앙값), 75%(3사분위), max(최대)를 자동으로 계산해줍니다.\r
  tips:\r
  - fare의 max가 $512인데 mean이 $32인 큰 격차는 분포가 한쪽으로 치우쳐 있다는 신호입니다 - 1등석 운임이 극단적으로 비쌌습니다.\r
  snippet: titanic.describe()\r
  exercise:\r
    prompt: include=all 옵션을 추가해 문자열 컬럼(sex 등)의 통계도 함께 보세요.\r
    starterCode: titanic.describe()\r
    hints:\r
    - include=all을 주면 unique/top/freq 같은 범주형 통계도 함께 표시됩니다.\r
    - 컬럼이 늘어나면 결과 DataFrame의 shape도 함께 늘어납니다.\r
  check:\r
    type: noError\r
    noError: describe() 호출이 정상 실행되어 통계 DataFrame을 반환해야 합니다.\r
    resultCheck: 결과 인덱스에 count, mean, std, min, max가 모두 포함되어야 합니다.\r
- id: step9_normalize\r
  title: 9단계. 비율로 보기\r
  structuredPrimary: true\r
  subtitle: normalize=True\r
  goal: value_counts에 normalize=True를 주어 빈도가 아닌 비율로 본다.\r
  why: 81 vs 99 같은 절대 수치보다 0.45 vs 0.55 같은 비율이 더 직관적입니다. 보고서나 시각화에는 비율이 더 적합합니다.\r
  explanation: |-\r
    value_counts에 normalize=True 파라미터를 추가하면 개수 대신 비율(백분율)을 보여줍니다. 전체에서 각 값이 차지하는 상대적 비중을 파악할 때 유용합니다. 개수만 보면 절대적 규모를 알 수 있지만, 비율을 보면 전체 대비 어느 정도 비중인지 직관적으로 이해할 수 있습니다. 3등석이 약 55%, 1등석이 약 24%, 2등석이 약 21%를 차지합니다.\r
\r
    normalize=True의 결과는 0에서 1 사이의 소수로 표시됩니다. 백분율로 보려면 * 100을 곱하면 됩니다.\r
  tips:\r
  - normalize=True 결과의 sum()은 항상 1.0이 되어야 합니다 - 그렇지 않으면 결측치가 있다는 신호입니다.\r
  snippet: titanic['pclass'].value_counts(normalize=True)\r
  exercise:\r
    prompt: pclass 대신 sex나 survived로 바꿔 성별/생존 비율을 비교하세요.\r
    starterCode: titanic['pclass'].value_counts(normalize=True)\r
    hints:\r
    - sex는 male이 약 65%, female이 약 35%입니다.\r
    - survived는 0이 45%, 1이 55%입니다.\r
  check:\r
    type: noError\r
    noError: normalize 옵션 호출이 정상 실행되어야 합니다.\r
    resultCheck: 결과 Series의 sum()이 1.0에 가까운 값이어야 합니다.\r
- id: step10_survival_rate\r
  title: 10단계. 1등석 생존율\r
  structuredPrimary: true\r
  subtitle: 필터링 + 통계 조합\r
  goal: pclass==1 필터링 + survived.mean() 조합으로 1등석 생존율(약 72%)을 한 줄에 계산한다.\r
  why: 0/1 이진 변수의 평균이 곧 1의 비율이라는 트릭이 이 강의의 가장 강력한 도구입니다. 같은 패턴이 합격률, 클릭률, 전환율 계산에 그대로 적용됩니다.\r
  explanation: |-\r
    이제 필터링과 통계를 조합해서 더 깊이 있는 분석을 수행합니다. 1등석 승객만 필터링한 후, survived 컬럼의 평균을 구하면 생존율을 계산할 수 있습니다. survived가 0(사망)과 1(생존)로 이루어져 있기 때문에, 평균값이 곧 생존한 사람의 비율이 됩니다. 로컬 샘플에서 1등석 생존율은 약 72%로, 전체 생존율 55%보다 높습니다. 메서드 체이닝을 통해 여러 작업을 한 줄로 연결할 수 있습니다.\r
\r
    0과 1로 이루어진 이진 변수의 평균은 1의 비율과 같습니다. 예를 들어 1, 0, 1, 1, 0의 평균은 0.6이며 60%가 1이라는 의미입니다. 이 트릭은 생존율, 합격률, 성공률 계산에 자주 사용됩니다.\r
  tips:\r
  - 등급별 생존율을 보면 1등석이 약 72%로 가장 높고, 2등석과 3등석은 약 47%입니다. 객실 등급별 차이를 비율로 비교하세요.\r
  snippet: titanic[titanic['pclass'] == 1]['survived'].mean()\r
  exercise:\r
    prompt: pclass == 1을 pclass == 3으로 바꿔 3등석 생존율을 구하고 1등석과 비교하세요.\r
    starterCode: titanic[titanic['pclass'] == 1]['survived'].mean()\r
    hints:\r
    - 3등석 생존율은 약 0.47로 1등석보다 낮습니다.\r
    - 두 결과의 차이가 객실 등급의 영향력을 보여줍니다.\r
  check:\r
    type: noError\r
    noError: 필터링 + mean 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과가 0과 1 사이의 float여야 합니다.\r
- id: step11_female\r
  title: 11단계. 여성 생존율\r
  structuredPrimary: true\r
  subtitle: 성별로 비교\r
  goal: sex == female 필터링으로 여성 생존율(100%)을 계산해 성별 차이가 로컬 샘플에 어떻게 들어 있는지 확인한다.\r
  why: 데이터 분석은 가설을 수치로 검증하는 과정입니다. 역사적 서술이 데이터에서 실제로 보이는지 확인하는 것이 분석의 핵심 가치입니다.\r
  explanation: 타이타닉 침몰 당시 "여성과 어린이 먼저(Women and children first)" 원칙이 실제로 적용되었는지 데이터로 확인해봅니다. 여성 승객만 필터링한\r
    후 생존율을 계산하면 100%가 나옵니다. 이는 전체 생존율 55%, 남성 생존율 25%와 비교하면 압도적으로 높은 수치입니다. 로컬 샘플에서 성별 차이가 크게 설계되었음을\r
    데이터가 입증합니다.\r
  tips:\r
  - 문자열 비교는 따옴표가 필수입니다 - sex == female이 아니라 sex == "female"이어야 합니다(파이썬 변수처럼 인식되어 NameError).\r
  snippet: titanic[titanic['sex'] == 'female']['survived'].mean()\r
  exercise:\r
    prompt: female을 male로 바꿔 남성 생존율을 구하고 여성과 비교하세요.\r
    starterCode: titanic[titanic['sex'] == 'female']['survived'].mean()\r
    hints:\r
    - 남성 생존율은 0.25로 여성보다 낮습니다.\r
    - 100% vs 25%의 차이가 로컬 샘플의 성별 생존율 차이를 보여줍니다.\r
  check:\r
    type: noError\r
    noError: 문자열 비교 필터링이 정상 실행되어야 합니다.\r
    resultCheck: 결과가 0과 1 사이의 float여야 합니다.\r
- id: step12_loc\r
  title: 12단계. loc 사용\r
  structuredPrimary: true\r
  subtitle: 조건 + 컬럼 동시 선택\r
  goal: df.loc 행조건 열선택 형태로 행 필터링과 컬럼 선택을 한 번에 한다.\r
  why: titanic[조건]['컬럼']은 두 번의 인덱싱이지만 .loc은 한 번입니다. 메모리와 가독성에서 .loc이 권장됩니다.\r
  explanation: |-\r
    loc은 DataFrame에서 행과 열을 동시에 선택할 수 있는 강력한 인덱서입니다. .loc 행조건 컬럼 형태로 사용하며, 행은 Boolean 조건식으로, 열은 컬럼명이나 리스트로 지정합니다. 지금까지는 titanic[조건][컬럼] 형태로 두 번 선택했지만, loc을 사용하면 한 번에 처리할 수 있어 더 효율적입니다. 생존자의 나이만 뽑아내는 것처럼 특정 조건의 특정 컬럼을 분석할 때 매우 유용합니다.\r
\r
    loc에서 열을 리스트로 주면 여러 컬럼을 동시에 선택할 수 있습니다. titanic.loc 행조건 컬럼리스트 형태로 사용하면 생존자의 나이, 성별, 등급을 한번에 볼 수 있습니다.\r
  tips:\r
  - .loc은 SettingWithCopyWarning을 피해갑니다 - 값을 변경하려면 반드시 .loc 표기법을 쓰세요.\r
  snippet: titanic.loc[titanic['survived'] == 1, 'age'].head()\r
  exercise:\r
    prompt: age 대신 fare로 바꾸거나 컬럼을 리스트로 만들어 여러 컬럼을 동시에 선택하세요.\r
    starterCode: titanic.loc[titanic['survived'] == 1, 'age'].head()\r
    hints:\r
    - 단일 컬럼이면 Series, 컬럼 리스트면 DataFrame이 반환됩니다.\r
    - 컬럼 리스트의 예는 [age, sex, pclass]입니다.\r
  check:\r
    type: noError\r
    noError: .loc 호출이 정상 실행되어야 합니다.\r
    resultCheck: 결과가 Series 또는 DataFrame이고 행 수가 생존자 수와 같아야 합니다.\r
- id: step13_iloc\r
  title: 13단계. iloc 사용\r
  structuredPrimary: true\r
  subtitle: 번호로 선택\r
  goal: .iloc[정수]로 위치(0부터 시작)로 단일 행을 선택한다.\r
  why: loc은 컬럼명, iloc은 행 번호. 검색 기반과 위치 기반의 차이를 명확히 구분해두면 SettingWithCopyWarning 같은 함정을 피할 수 있습니다.\r
  explanation: |-\r
    loc이 레이블(이름)로 선택한다면, iloc은 정수 위치(integer location)로 선택합니다. iloc은 0부터 시작하는 인덱스 번호로 행과 열을 선택하며, 파이썬의 리스트 인덱싱과 동일하게 작동합니다. iloc[0]은 첫 번째 행, iloc[1]은 두 번째 행을 의미합니다. 컬럼명이나 조건과 무관하게 순수하게 위치만으로 데이터를 선택할 때 사용합니다.\r
\r
    loc과 iloc의 차이는 loc은 레이블(컬럼명, 인덱스명), iloc은 정수 위치로 선택한다는 점입니다. loc[0]은 인덱스 이름이 0인 행을, iloc[0]은 첫 번째 행을 의미합니다. 조건 기반 필터링에는 loc, 위치 기반 선택에는 iloc을 사용하세요.\r
  tips:\r
  - iloc은 음수도 받습니다 - iloc[-1]은 마지막 행입니다.\r
  snippet: titanic.iloc[0]\r
  exercise:\r
    prompt: 0을 5나 -1로 바꿔 다섯 번째 행, 마지막 행을 선택해보세요.\r
    starterCode: titanic.iloc[0]\r
    hints:\r
    - iloc[5]는 인덱스 5인 행(여섯 번째)을, iloc[-1]은 마지막 행을 반환합니다.\r
    - 결과는 Series이고 인덱스가 컬럼 이름입니다.\r
  check:\r
    type: noError\r
    noError: iloc 호출이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 Series이고 인덱스가 원본 DataFrame의 컬럼 이름이어야 합니다.\r
- id: step14_iloc_range\r
  title: 14단계. iloc 범위 선택\r
  structuredPrimary: true\r
  subtitle: 행과 열 범위 지정\r
  goal: iloc에 슬라이스(0:3, 0:4)를 넘겨 직사각형 영역을 한 번에 추출한다.\r
  why: 대용량 데이터에서 일부 행과 일부 컬럼만 빠르게 보고 싶을 때 표준 패턴입니다.\r
  explanation: |-\r
    iloc은 슬라이싱을 지원하여 범위로 선택할 수 있습니다. iloc 행시작:행끝, 열시작:열끝 형태로 사용하며, 파이썬 슬라이싱 규칙을 따릅니다. 시작 인덱스는 포함되고 끝 인덱스는 제외됩니다. 예를 들어 0:3은 0, 1, 2 세 개의 행을 선택합니다. 행과 열을 동시에 범위 지정하면 데이터의 특정 부분만 추출할 수 있습니다. 대용량 데이터에서 일부만 샘플링할 때 유용합니다.\r
\r
    슬라이싱에서 콜론만 쓰면 전체를 의미합니다. iloc 전체:5는 처음 5행 전체 컬럼, iloc 전체, 전체:3은 전체 행의 처음 3개 컬럼을 선택합니다. iloc 음수 -1은 마지막 행, iloc 음수 -5:는 마지막 5개 행을 선택합니다.\r
  tips:\r
  - 슬라이스 끝 인덱스는 제외됩니다 - iloc[0:3]은 인덱스 0, 1, 2 세 행만 가져옵니다.\r
  snippet: titanic.iloc[0:3, 0:4]\r
  exercise:\r
    prompt: 슬라이스를 더 넓은 범위로 늘리거나 음수 인덱스를 활용해 결과 shape가 어떻게 달라지는지 확인하세요.\r
    starterCode: titanic.iloc[0:3, 0:4]\r
    hints:\r
    - 결과 shape는 (행 슬라이스 길이, 열 슬라이스 길이)입니다.\r
    - 음수 시작 인덱스(예 minus 3 콜론)는 마지막 3행을 의미합니다.\r
  check:\r
    type: noError\r
    noError: iloc 범위 선택이 정상 실행되어야 합니다.\r
    resultCheck: 결과 shape가 슬라이스 범위와 일치해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 생존율 리포트 만들기'\r
  structuredPrimary: true\r
  subtitle: 필터링, groupby, loc/iloc, 실패 케이스\r
  goal: 합성 4행 DataFrame으로 groupby 생존율, loc 어린이 생존율, iloc 위치 선택 네 결과를 assert로 동시에 고정한다.\r
  why: 생존율 분석은 행 필터를 잘못 잡아도 숫자는 나옵니다. 합성 데이터 + assert로 기대값을 미리 박아두면 잘못된 필터링을 즉시 잡을 수 있습니다.\r
  explanation: |-\r
    생존율 분석은 행을 잘못 필터링해도 숫자는 나오기 때문에 검증이 중요합니다. 필수 컬럼을 확인하고, 등급별 생존율과 어린이 생존율을 따로 계산해 기대값을 고정하세요.\r
\r
    변주 실험: 어린이 기준을 13세에서 16세로 바꾸고, 생존율이 변하는지 같은 코드로 비교하세요.\r
  tips:\r
  - groupby + mean으로 등급별 생존율을 한 줄에 만들 수 있습니다 - 이건 다음 강의(pandas 03)의 핵심 주제입니다.\r
  - .loc[정수]는 인덱스 레이블이 정수인 행을 가져옵니다. RangeIndex DataFrame에서는 iloc과 같은 결과가 나옵니다.\r
  snippet: |-\r
    import pandas as pd\r
\r
    titanic = pd.DataFrame({\r
        "pclass": [1, 1, 3, 3],\r
        "age": [38, 10, 22, 8],\r
        "survived": [1, 1, 0, 1],\r
    })\r
\r
    classRate = titanic.groupby("pclass")["survived"].mean()\r
    childRate = titanic.loc[titanic["age"] < 13, "survived"].mean()\r
\r
    assert classRate.loc[1] == 1.0\r
    assert round(classRate.loc[3], 2) == 0.5\r
    assert childRate == 1.0\r
    assert titanic.iloc[0]["pclass"] == 1\r
  exercise:\r
    prompt: survived 값을 바꿔 classRate assert가 어떻게 깨지는지 확인하고 우변을 새 값으로 갱신하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      titanic = pd.DataFrame({\r
          "pclass": [1, 1, 3, 3],\r
          "age": [38, 10, 22, 8],\r
          "survived": [1, 1, 0, 1],\r
      })\r
\r
      classRate = titanic.groupby("pclass")["survived"].mean()\r
      childRate = titanic.loc[titanic["age"] < 13, "survived"].mean()\r
\r
      assert classRate.loc[1] == 1.0\r
      assert round(classRate.loc[3], 2) == 0.5\r
      assert childRate == 1.0\r
      assert titanic.iloc[0]["pclass"] == 1\r
    hints:\r
    - pclass 1 두 명 모두 survived 1이라 평균은 1.0입니다.\r
    - childRate는 age < 13인 2명(10, 8) 모두 survived 1이라 1.0입니다.\r
  check:\r
    type: noError\r
    noError: groupby/loc/iloc 모든 호출이 정상 실행되어야 합니다.\r
    resultCheck: 네 assert 모두 통과해야 하며, 데이터를 바꾸면 그에 맞춰 우변도 갱신되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 타이타닉 생존 분석 프로젝트\r
  goal: 배운 필터링/value_counts/loc 패턴을 직접 조합해 자신만의 생존 요인 분석을 수행한다.\r
  why: 가이드된 단계만 따라가는 학습보다 빈 셀에서 시작하는 실습이 손에 익는 정도가 다릅니다.\r
  explanation: |-\r
    배운 내용으로 타이타닉 생존 요인을 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  tips:\r
  - 가설을 한 문장으로 적은 뒤 그에 필요한 필터링을 작성하고 mean으로 검증하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset("titanic")\r
  exercise:\r
    prompt: data에서 어린이(age < 13)와 성인의 생존율을 각각 구하고 차이를 비교하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset("titanic")\r
    hints:\r
    - 어린이 필터링은 data[data['age'] < 13]['survived'].mean() 형태입니다.\r
    - 성인은 age >= 13으로 필터링하면 됩니다.\r
  check:\r
    type: noError\r
    noError: loadLocalDataset과 그 뒤 분석 코드가 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 0과 1 사이의 생존율 값들이어야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 조건 필터링의 핵심 개념을 배웠습니다. Boolean Indexing을 통해 원하는 조건의 데이터만 골라내고, loc/iloc을 사용해서 행과 열을 효율적으로\r
      선택하는 방법을 익혔습니다. 이 기술들은 실제 데이터 분석에서 가장 많이 사용되는 필수 스킬입니다.\r
  - type: list\r
    items:\r
    - df[['컬럼1', '컬럼2']] - 여러 컬럼 선택 (2겹 대괄호)\r
    - df[df['컬럼'] == 값] - 조건 필터링 (Boolean Indexing)\r
    - df['컬럼'].value_counts() - 값별 개수 세기\r
    - df['컬럼'].value_counts(normalize=True) - 비율로 보기\r
    - df.loc[조건, '컬럼'] - 조건 + 컬럼 동시 선택 (레이블)\r
    - df.iloc[번호] - 위치로 선택 (정수 인덱스)\r
  - type: text\r
    content: 다음 시간에는 펭귄 데이터로 groupby를 배웁니다. 그룹별로 통계를 한 번에 구하는 강력한 기능입니다.\r
  goal: 이 강의에서 익힌 필터링/value_counts/loc·iloc 6가지 패턴을 머릿속에 정리한다.\r
  why: 같은 패턴이 다음 강의(펭귄 groupby)와 후속 모든 데이터 분석 트랙에서 그대로 반복됩니다. 한 번 정리해두면 다음 강의가 빠르게 진입합니다.\r
`;export{e as default};