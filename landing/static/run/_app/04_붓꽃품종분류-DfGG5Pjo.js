var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_04\r
  title: 붓꽃품종분류\r
  order: 4\r
  category: pandas\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  dataSource: codaro-local:iris\r
  tags:\r
  - iris\r
  - 결측치\r
  - apply\r
  - map\r
  - 새컬럼\r
  - 검증\r
  - 데이터정제\r
  seo:\r
    title: pandas 결측치 처리와 새 컬럼 만들기 - 붓꽃 데이터\r
    description: 붓꽃 데이터로 결측치 처리(dropna, fillna)와 새 컬럼 추가(assign, apply, map)를 배웁니다. 꽃잎 면적 계산 실습.\r
    keywords:\r
    - pandas 결측치\r
    - dropna fillna\r
    - apply map\r
    - assign\r
    - iris 데이터\r
intro:\r
  emoji: 🌸\r
  goal: 붓꽃 데이터에서 "품종별 꽃잎 면적"을 계산하고 비교합니다.\r
  description: 결측치 처리와 새로운 컬럼을 만드는 방법을 배웁니다. 기존에 없던 값을 계산해서 추가합니다.\r
  direction: 붓꽃 데이터로 결측치 처리 + assign 파생 컬럼 + apply/map + 문자열 처리까지, 데이터 정제의 전 흐름을 한 강의에 익힙니다.\r
  benefits:\r
  - isna/info로 결측치를 확인하고 dropna/fillna 두 가지 처리 전략을 손에 익힙니다.\r
  - assign으로 petal_length × petal_width 같은 파생 컬럼을 만들고 groupby에 연결합니다.\r
  - apply + lambda로 행/열 단위 변환을, map으로 1대1 치환을 익힙니다.\r
  - str 접근자(upper, contains)와 duplicated/drop_duplicates로 텍스트·중복 정제까지 다룹니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로드 + 결측 확인\r
      detail: loadLocalDataset(iris)로 150행 DataFrame을 만들고 isna/info로 결측 분포를 본다.\r
    - label: 2단계. dropna/fillna로 결측 처리\r
      detail: 두 전략의 행 수 차이를 직접 비교한다.\r
    - label: 3단계. assign으로 파생 컬럼 + groupby\r
      detail: petalArea 컬럼을 만들고 품종별 평균으로 분리력을 확인한다.\r
    - label: 4단계. apply/map/str로 추가 변환\r
      detail: 조건 분류, 값 치환, 문자열 처리, 중복 제거를 단계별로 실행한다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 붓꽃품종분류 실행\r
      detail: 셀을 실행해 행/열 수, 결측 개수, 파생 컬럼 값과 예외 상태를 확인합니다.\r
    - label: 붓꽃품종분류 완료\r
      detail: 검증된 정제 코드를 분류 모델 입력 파이프라인으로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 붓꽃 데이터\r
  goal: loadLocalDataset로 iris DataFrame을 불러오고 shape으로 150행 4컬럼을 확인한다.\r
  why: iris 데이터셋은 모든 통계/ML 튜토리얼의 기본 입력입니다. 한 번 익혀두면 다음 강의들에서 같은 데이터로 다른 기법을 연습할 때 빠르게 따라갈 수 있습니다.\r
  explanation: 150송이 붓꽃, 3품종(setosa, versicolor, virginica) 각 50송이씩입니다. 로컬 실행에서는 네트워크가 없어도 결측치 처리, 새 컬럼,\r
    apply/map 흐름을 연습할 수 있도록 같은 컬럼 구조의 샘플 데이터를 함께 둡니다.\r
  tips:\r
  - iris의 컬럼은 sepal_length, sepal_width, petal_length, petal_width, species 5개입니다. 앞 4개는 cm 단위입니다.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    iris = loadLocalDataset("iris")\r
    iris.shape\r
  exercise:\r
    prompt: shape 대신 columns나 dtypes를 호출해 컬럼 이름과 데이터 타입을 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      iris = loadLocalDataset("iris")\r
      iris.shape\r
    hints:\r
    - dtypes는 각 컬럼의 NumPy 타입을 Series로 반환합니다.\r
    - 숫자 컬럼은 float64, species는 object(문자열)일 것입니다.\r
  check:\r
    type: noError\r
    noError: loadLocalDataset 호출과 그 뒤 shape 호출이 정상 실행되어야 합니다.\r
    resultCheck: shape 결과가 (150, 5) 또는 그에 준하는 튜플이어야 합니다.\r
- id: step2_head\r
  title: 2단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 데이터 구조 파악\r
  goal: head()로 앞 5행을 보고 어떤 컬럼이 면적 계산에 쓸 수 있는지 파악한다.\r
  why: 컬럼 이름을 미리 알아야 다음 단계의 assign에서 petal_length × petal_width 같은 식을 정확히 쓸 수 있습니다.\r
  explanation: petal_length(꽃잎 길이)와 petal_width(꽃잎 너비)로 면적을 계산할 수 있습니다. setosa는 모두 작고, virginica는 모두 크다는 패턴이 데이터 첫 행부터 보입니다.\r
  tips:\r
  - head()와 tail()로 위/아래를 한 번씩 보면 정렬 상태(species가 묶여 있는지)를 확인할 수 있습니다.\r
  snippet: iris.head()\r
  exercise:\r
    prompt: head() 대신 iris.sample(5)를 시도해 무작위 5행을 뽑아 정렬과 상관없는 미리보기를 만들어보세요.\r
    starterCode: iris.head()\r
    hints:\r
    - sample(n)은 매번 다른 행을 무작위로 반환합니다.\r
    - 재현이 필요하면 sample(5, random_state=42)처럼 시드를 고정하세요.\r
  check:\r
    type: noError\r
    noError: head() 호출이 정상 실행되어 DataFrame을 반환해야 합니다.\r
    resultCheck: 결과 DataFrame이 원본 컬럼을 모두 포함하고 5행이어야 합니다.\r
- id: step3_isna\r
  title: 3단계. 결측치 확인\r
  structuredPrimary: true\r
  subtitle: isna().sum()\r
  goal: isna().sum()으로 컬럼별 결측치 개수를 한 번에 확인한다.\r
  why: 결측이 있는 컬럼을 모르고 평균을 구하면 결측치가 자동 무시되어 표본 수가 줄어든 결과가 나옵니다. 분석 전 결측 분포를 보는 것이 첫 정제 단계입니다.\r
  explanation: |-\r
    실제 데이터에는 종종 결측치(Missing Value, NaN)가 포함되어 있습니다. 결측치는 측정 실패, 입력 누락 등 다양한 이유로 발생합니다. isna()는 각 값이 결측치인지 True/False로 반환하고, sum()을 붙이면 컬럼별로 결측치 개수를 세어줍니다. 데이터 분석 전에 반드시 확인해야 하는 중요한 단계입니다.\r
\r
    isna()와 isnull()은 같은 기능입니다. 둘 다 사용 가능하며, 결측치를 True로 표시합니다. 반대로 notna()나 notnull()은 결측치가 아닌 값을 True로 표시합니다.\r
  tips:\r
  - isna().sum().sum()을 더 붙이면 전체 결측치 총합을 한 숫자로 얻을 수 있습니다.\r
  snippet: iris.isna().sum()\r
  exercise:\r
    prompt: isna 대신 notna로 바꿔보고 결과 합계가 (행 수 × 컬럼 수) - 결측 수와 같은지 확인하세요.\r
    starterCode: iris.isna().sum()\r
    hints:\r
    - notna는 결측이 아닌 값을 True로 표시합니다.\r
    - isna 합계 + notna 합계 = 전체 셀 수가 됩니다.\r
  check:\r
    type: noError\r
    noError: isna().sum() 호출이 정상 실행되어 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 인덱스가 컬럼 이름이고 값이 0 이상의 정수여야 합니다.\r
- id: step4_info\r
  title: 4단계. 전체 정보\r
  structuredPrimary: true\r
  subtitle: info()로 확인\r
  goal: info()로 컬럼별 데이터 타입과 Non-Null Count를 한 화면에 본다.\r
  why: isna는 결측 개수만 주지만 info는 dtype까지 함께 보여줍니다. object 타입 컬럼이 사실은 숫자인데 잘못 들어온 경우를 빠르게 잡아낼 수 있습니다.\r
  explanation: info()의 Non-Null Count가 150이면 결측치가 없다는 뜻입니다. Dtype 컬럼이 object면 문자열, float64면 숫자, int64면 정수입니다.\r
  tips:\r
  - info(memory_usage=True)를 쓰면 DataFrame이 차지하는 메모리도 확인할 수 있어 대용량 데이터에 유용합니다.\r
  snippet: iris.info()\r
  exercise:\r
    prompt: iris.info() 출력을 보고 어떤 컬럼이 object 타입인지 확인하고 그것이 어떤 컬럼일지 예상해보세요.\r
    starterCode: iris.info()\r
    hints:\r
    - 보통 species 같은 문자열 컬럼만 object입니다.\r
    - object 컬럼이 숫자여야 하는데 object로 잡혀 있다면 정제가 필요합니다.\r
  check:\r
    type: noError\r
    noError: info() 호출이 정상 실행되어야 합니다 (출력은 화면에 표시됨).\r
    resultCheck: info 출력에 RangeIndex, Data columns, Non-Null Count, Dtype 항목이 모두 나와야 합니다.\r
- id: step5_dropna\r
  title: 5단계. 결측치 삭제\r
  structuredPrimary: true\r
  subtitle: dropna()\r
  goal: dropna()로 결측이 있는 행을 제거한 DataFrame을 만들고 원본/정제 행 수를 비교한다.\r
  why: 결측치 처리의 첫 번째 전략은 삭제입니다. 표본이 충분히 많고 결측이 일부일 때 가장 안전합니다 - iris는 결측이 없어 행 수가 그대로지만 패턴은 익혀둡니다.\r
  explanation: |-\r
    dropna() 메서드는 결측치가 있는 행을 삭제합니다. 기본적으로 한 행에 하나라도 결측치가 있으면 그 행 전체를 제거합니다. 이 데이터는 결측치가 없어서 삭제되는 행이 없지만, 실제 데이터에서는 자주 사용하는 전처리 방법입니다. 원본은 유지되고 새로운 DataFrame을 반환합니다.\r
\r
    dropna()는 기본적으로 행(row)을 삭제하지만, axis=1을 추가하면 열(column)을 삭제합니다. 또한 subset=['컬럼명']을 지정하면 특정 컬럼의 결측치만 기준으로 삼을 수 있습니다.\r
  tips:\r
  - dropna(how='all')은 모든 컬럼이 결측인 행만 삭제합니다 - 기본값(how='any')보다 보수적입니다.\r
  snippet: |-\r
    clean = iris.dropna()\r
    len(iris), len(clean)\r
  exercise:\r
    prompt: dropna에 axis=1을 추가해 행 대신 컬럼이 어떻게 삭제되는지 확인하세요.\r
    starterCode: |-\r
      clean = iris.dropna()\r
      len(iris), len(clean)\r
    hints:\r
    - axis=1이면 결측이 하나라도 있는 컬럼을 삭제합니다.\r
    - 결측이 없는 iris에서는 axis=1이어도 컬럼 수가 그대로입니다.\r
  check:\r
    type: noError\r
    noError: dropna 호출이 정상 실행되어 DataFrame을 반환해야 합니다.\r
    resultCheck: len(clean) <= len(iris) 관계가 성립해야 합니다.\r
- id: step6_fillna\r
  title: 6단계. 결측치 채우기\r
  structuredPrimary: true\r
  subtitle: fillna()\r
  goal: fillna(0)로 결측치를 특정 값으로 대체하고, 더 일반적으로는 평균/중앙값으로 채우는 패턴을 익힌다.\r
  why: 삭제 대신 채우기를 선택하는 이유는 행 수를 유지하기 위해서입니다. 매출 같은 시계열은 한 행 삭제가 분석에 큰 영향을 줍니다.\r
  explanation: fillna() 메서드는 결측치를 특정 값으로 대체합니다. 삭제하는 대신 채우는 방식으로 처리할 수 있습니다. 0으로 채우거나, 평균값(fillna(df.mean())),\r
    중앙값(fillna(df.median())), 최빈값 등 다양한 전략을 사용할 수 있습니다. 데이터의 특성에 맞는 방법을 선택하는 것이 중요합니다.\r
  tips:\r
  - fillna(method='ffill')은 앞 행 값으로, method='bfill'은 뒤 행 값으로 채웁니다 - 시계열에서 자주 씁니다.\r
  snippet: |-\r
    filled = iris.fillna(0)\r
    filled.isna().sum()\r
  exercise:\r
    prompt: fillna(0) 대신 fillna(iris.mean(numeric_only=True))로 바꿔 숫자 컬럼만 평균으로 채워보세요.\r
    starterCode: |-\r
      filled = iris.fillna(0)\r
      filled.isna().sum()\r
    hints:\r
    - mean(numeric_only=True)은 숫자 컬럼의 평균만 Series로 반환합니다.\r
    - fillna에 Series를 넘기면 컬럼 이름이 일치하는 곳에만 적용됩니다.\r
  check:\r
    type: noError\r
    noError: fillna 호출이 정상 실행되어야 합니다.\r
    resultCheck: filled.isna().sum()의 모든 값이 0이어야 합니다.\r
- id: step7_assign\r
  title: 7단계. 새 컬럼 추가\r
  structuredPrimary: true\r
  subtitle: assign()\r
  goal: assign으로 petalArea = petal_length × petal_width 파생 컬럼을 안전하게 추가한다.\r
  why: Codaro 노트북은 셀 격리되어 있어 iris['새컬럼'] = ... 같은 in-place 할당이 깨질 수 있습니다. assign은 새 DataFrame을 반환해 이 문제를 피합니다.\r
  explanation: |-\r
    assign() 메서드는 기존 DataFrame에 새로운 컬럼을 추가한 DataFrame을 반환합니다. 원본은 변경하지 않고 새로운 DataFrame을 만들기 때문에 Codaro 환경에서 안전하게 사용할 수 있습니다. 꽃잎 길이와 너비를 곱해서 면적을 계산하는 것처럼, 기존 컬럼들을 조합해서 새로운 의미 있는 데이터를 만들 수 있습니다.\r
\r
    assign()은 여러 컬럼을 동시에 추가할 수 있습니다. iris.assign(petalArea=..., sepalArea=...) 형태로 작성하면 됩니다. df['새컬럼'] = 값 방식도 가능하지만, Codaro에서는 변수 재할당 문제가 발생할 수 있어 assign()을 권장합니다.\r
  tips:\r
  - assign 인자에 lambda를 넘기면 메서드 체이닝 중간에서도 새 컬럼을 만들 수 있습니다 - df.query(...).assign(area=lambda d: d.x * d.y).\r
  snippet: |-\r
    withArea = iris.assign(petalArea=iris['petal_length'] * iris['petal_width'])\r
    withArea.head()\r
  exercise:\r
    prompt: assign에 sepalArea=iris의 sepal_length × sepal_width 식을 추가해 두 면적 컬럼을 동시에 만들어보세요.\r
    starterCode: |-\r
      withArea = iris.assign(petalArea=iris['petal_length'] * iris['petal_width'])\r
      withArea.head()\r
    hints:\r
    - assign(컬럼1=식1, 컬럼2=식2) 형태로 여러 컬럼을 동시에 만들 수 있습니다.\r
    - 결과 DataFrame의 columns에 petalArea와 sepalArea가 모두 있는지 확인하세요.\r
  check:\r
    type: noError\r
    noError: assign 호출이 정상 실행되어 DataFrame을 반환해야 합니다.\r
    resultCheck: withArea의 컬럼 수가 원본보다 1 이상 많고 petalArea가 포함되어야 합니다.\r
- id: step8_groupby_area\r
  title: 8단계. 품종별 평균 면적\r
  structuredPrimary: true\r
  subtitle: 목표 달성!\r
  goal: 파생 컬럼 petalArea를 groupby('species').mean()으로 품종별 평균으로 집계한다.\r
  why: 새 컬럼이 의미 있는지 확인하려면 그룹별 평균이 분리되는지 보면 됩니다. setosa < versicolor < virginica로 단조 증가하면 면적이 좋은 분류 특성입니다.\r
  explanation: 이제 품종별 평균 면적을 구할 수 있습니다. virginica가 가장 크고(약 11.3), versicolor가 중간(약 5.7), setosa가 가장 작습니다(약 0.4). 단순한 곱셈 하나로 분류 성능이 높은 특성을 만들었습니다.\r
  tips:\r
  - 면적 차이가 클수록 분류가 쉽습니다. petalArea의 그룹 간 차이는 sepal_length의 그룹 간 차이보다 훨씬 커서 분류에 더 유용합니다.\r
  snippet: withArea.groupby('species')['petalArea'].mean()\r
  exercise:\r
    prompt: petalArea 대신 sepal_length로 그룹 평균을 구해 차이의 크기를 비교해보세요.\r
    starterCode: withArea.groupby('species')['petalArea'].mean()\r
    hints:\r
    - sepal_length의 그룹 평균은 비슷한 값들이라 분류력이 약합니다.\r
    - petalArea가 더 좋은 특성임을 수치로 확인할 수 있습니다.\r
  check:\r
    type: noError\r
    noError: groupby + mean 체인이 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과 Series의 인덱스에 setosa, versicolor, virginica 3종이 모두 있어야 합니다.\r
- id: step8_5_filter_species\r
  title: 8.5단계. 조건 필터링 복습\r
  structuredPrimary: true\r
  subtitle: 특정 품종만 분석\r
  goal: virginica 품종만 필터링해서 describe()로 면적 분포를 자세히 본다.\r
  why: 그룹 평균만 보면 그룹 내 변동을 알 수 없습니다. virginica 안에서도 가장 큰 꽃과 가장 작은 꽃의 차이가 얼마나 되는지 들여다보는 단계입니다.\r
  explanation: |-\r
    이전에 배운 조건 필터링을 복습합니다. virginica 품종만 선택해서 꽃잎 면적의 통계를 확인해봅니다. DataFrame[조건] 형태로 필터링하는 방법은 이전 프로젝트(02번)에서 배웠습니다. 필터링 후 describe()로 통계를 보면 해당 품종의 분포를 상세히 파악할 수 있습니다.\r
\r
    필터링은 데이터 분석의 핵심입니다. 전체 데이터 중 원하는 부분만 선택해서 집중 분석할 수 있습니다. 여러 조건을 조합할 때는 괄호로 감싸고 &(and), |(or)로 연결합니다.\r
  tips:\r
  - 단일 컬럼에 describe를 호출하면 count/mean/std/min/25%/50%/75%/max 8개 통계를 한 번에 줍니다.\r
  snippet: |-\r
    virginica = withArea[withArea['species'] == 'virginica']\r
    virginica['petalArea'].describe()\r
  exercise:\r
    prompt: virginica 대신 setosa나 versicolor로 바꿔 같은 분포를 비교해보세요.\r
    starterCode: |-\r
      virginica = withArea[withArea['species'] == 'virginica']\r
      virginica['petalArea'].describe()\r
    hints:\r
    - setosa의 std는 매우 작아 균일한 분포임을 보여줍니다.\r
    - virginica는 max - min 폭이 가장 큽니다.\r
  check:\r
    type: noError\r
    noError: 필터링 + describe 호출이 정상 실행되어야 합니다.\r
    resultCheck: 결과 Series의 인덱스에 count, mean, std, min, 25%, 50%, 75%, max가 모두 있어야 합니다.\r
- id: step9_apply\r
  title: 9단계. apply 기본\r
  structuredPrimary: true\r
  subtitle: 모든 값에 함수 적용\r
  goal: apply에 lambda를 넘겨 Series의 모든 값에 함수를 적용하는 패턴을 익힌다.\r
  why: pandas의 벡터 연산(iris['col'] * 2)이 더 빠르지만, 복잡한 로직이 필요하면 apply + lambda 조합이 표준입니다. 이 한 줄이 모든 변환의 기본 형태입니다.\r
  explanation: |-\r
    apply() 메서드는 Series나 DataFrame의 모든 값에 특정 함수를 적용합니다. 복잡한 계산이나 변환이 필요할 때 매우 유용합니다. lambda는 이름 없는 익명 함수를 한 줄로 정의하는 방법으로, apply()와 자주 함께 사용됩니다. lambda x: x * 2는 x를 받아서 x * 2를 반환하는 함수라는 뜻입니다.\r
\r
    lambda는 def 함수의 간단 버전입니다. lambda x: x * 2는 def double(x): return x * 2와 같습니다. 간단한 변환에는 lambda가 편리하지만, 복잡한 로직에는 def로 함수를 정의하는 것이 좋습니다.\r
  tips:\r
  - 단순 곱셈/덧셈은 apply보다 iris['col'] * 2 같은 벡터 연산이 100배 이상 빠릅니다. apply는 진짜로 복잡한 로직에만 쓰세요.\r
  snippet: "iris['sepal_length'].apply(lambda x: x * 2).head()"\r
  exercise:\r
    prompt: lambda를 x ** 2로 바꿔 제곱값을 계산해보거나 round(x, 1)로 소수점 한 자리로 반올림해보세요.\r
    starterCode: "iris['sepal_length'].apply(lambda x: x * 2).head()"\r
    hints:\r
    - 결과가 원본 Series와 같은 길이여야 합니다.\r
    - round(x, 1)은 5.1 → 5.1, 5.123 → 5.1로 반올림합니다.\r
  check:\r
    type: noError\r
    noError: apply 호출이 정상 실행되어 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 길이가 원본 컬럼 길이와 같아야 합니다.\r
- id: step10_apply_condition\r
  title: 10단계. 조건 분류\r
  structuredPrimary: true\r
  subtitle: if-else 적용\r
  goal: apply + lambda에 if-else를 넣어 연속값을 large/small 같은 범주로 분류한다.\r
  why: 분류 모델 학습 전 연속값을 범주로 묶는 binning이 흔한 전처리입니다. lambda 안의 if-else 한 줄이 가장 빠른 binning 패턴입니다.\r
  explanation: lambda 표현식 안에서 a if 조건 else b 형태를 쓰면 조건부 변환이 가능합니다. petal_length가 3보다 크면 large, 아니면 small로 분류합니다. value_counts로 각 범주에 몇 개씩 들어갔는지 확인할 수 있습니다.\r
  tips:\r
  - 더 복잡한 분류는 def 함수로 빼는 것이 가독성이 좋습니다 - apply는 함수 이름도 받습니다.\r
  snippet: |-\r
    iris['petal_length'].apply(lambda x: 'large' if x > 3 else 'small').value_counts()\r
  exercise:\r
    prompt: 임계값 3을 1.5나 5로 바꿔 분류 결과의 large/small 비율이 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      iris['petal_length'].apply(lambda x: 'large' if x > 3 else 'small').value_counts()\r
    hints:\r
    - 임계값을 너무 낮추면 거의 모두 large가 되고, 너무 높이면 거의 모두 small이 됩니다.\r
    - setosa의 petal_length는 모두 2.0 이하라 임계값 2 근처에서 분리가 잘 됩니다.\r
  check:\r
    type: noError\r
    noError: apply + value_counts 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과 Series의 인덱스에 large 또는 small이 포함되어야 합니다.\r
- id: step11_map\r
  title: 11단계. map 값 치환\r
  structuredPrimary: true\r
  subtitle: 딕셔너리로 변환\r
  goal: map(dict)으로 species의 영문 값을 한글 값으로 1대1 치환한다.\r
  why: 보고서를 한국어로 만들 때 컬럼 값을 한글로 바꾸는 작업이 흔합니다. map은 apply보다 빠르고 단순 치환에 최적화되어 있습니다.\r
  explanation: |-\r
    map() 메서드는 값을 다른 값으로 매핑(치환)합니다. 딕셔너리를 넣으면 키를 찾아서 대응하는 값으로 바꿔줍니다. 코드 값을 의미 있는 이름으로 바꾸거나, 영어를 한글로 변환하는 등 다양하게 활용할 수 있습니다. apply보다 간단하고 빠르게 값을 변환할 수 있습니다.\r
\r
    map과 apply의 차이는 명확합니다 - map은 딕셔너리나 Series로 1대1 매핑만 가능하지만 빠릅니다. apply는 복잡한 로직도 처리할 수 있지만 느립니다. 단순 치환은 map, 조건문이나 계산은 apply를 사용하세요.\r
  tips:\r
  - dict에 없는 키는 NaN이 됩니다. dict.get(키, 기본값) 흉내를 내려면 fillna로 보강하거나 apply로 옮기세요.\r
  snippet: |-\r
    nameMap = {'setosa': '세토사', 'versicolor': '버시컬러', 'virginica': '버지니카'}\r
    iris['species'].map(nameMap).head()\r
  exercise:\r
    prompt: nameMap에서 한 키를 의도적으로 삭제하고 결과에 NaN이 나오는지 확인하세요.\r
    starterCode: |-\r
      nameMap = {'setosa': '세토사', 'versicolor': '버시컬러', 'virginica': '버지니카'}\r
      iris['species'].map(nameMap).head()\r
    hints:\r
    - dict에 없는 값은 NaN으로 변환됩니다.\r
    - 모든 행이 매핑되는지는 결과의 isna().sum()으로 검증할 수 있습니다.\r
  check:\r
    type: noError\r
    noError: map 호출이 정상 실행되어 Series를 반환해야 합니다.\r
    resultCheck: 결과 Series의 첫 값이 dict의 매핑된 한글 값이어야 합니다.\r
- id: step12_str_upper\r
  title: 12단계. 문자열 대문자\r
  structuredPrimary: true\r
  subtitle: str.upper()\r
  goal: Series의 .str 접근자로 모든 값을 대문자로 변환한다.\r
  why: pandas 문자열 처리는 항상 .str을 거칩니다. iris.species.upper()는 동작하지 않고 iris.species.str.upper()여야 한다는 규칙이 핵심입니다.\r
  explanation: pandas에서 문자열 컬럼을 다룰 때는 .str 접근자를 사용합니다. .str을 붙이면 파이썬의 모든 문자열 메서드를 사용할 수 있습니다. upper()는\r
    대문자로, lower()는 소문자로 변환합니다. 그 외에도 split(), replace(), strip() 등 다양한 문자열 처리 기능을 제공합니다.\r
  tips:\r
  - .str은 결측치(NaN)를 자동으로 건너뜁니다 - NaN.upper()로 에러가 나지 않습니다.\r
  snippet: iris['species'].str.upper().head()\r
  exercise:\r
    prompt: upper 대신 title이나 capitalize로 바꿔 첫 글자만 대문자로 만드는 결과를 비교하세요.\r
    starterCode: iris['species'].str.upper().head()\r
    hints:\r
    - title은 단어 첫 글자를, capitalize는 전체 첫 글자만 대문자로 만듭니다.\r
    - setosa.title() → Setosa, setosa.capitalize() → Setosa (한 단어라 동일).\r
  check:\r
    type: noError\r
    noError: str.upper 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과 Series의 모든 값이 대문자(예 SETOSA)여야 합니다.\r
- id: step13_str_contains\r
  title: 13단계. 포함 여부\r
  structuredPrimary: true\r
  subtitle: str.contains()\r
  goal: str.contains('a')로 특정 문자를 포함한 행을 boolean Series로 표시한다.\r
  why: 텍스트 검색은 데이터 필터링의 기본입니다. 이메일 도메인 필터, 카테고리 검색 같은 작업이 모두 이 패턴으로 풀립니다.\r
  explanation: str.contains는 특정 문자가 포함되어 있는지 True/False로 반환합니다. value_counts를 붙이면 True/False가 각각 몇 개인지 즉시 확인할 수 있습니다. setosa, versicolor, virginica 모두 a를 포함하므로 결과는 모두 True입니다.\r
  tips:\r
  - 정규식을 쓰려면 contains에 regex=True를 명시하세요. '^se' 같은 패턴이 됩니다.\r
  snippet: iris['species'].str.contains('a').value_counts()\r
  exercise:\r
    prompt: 문자 a 대신 sa나 vir로 바꿔 어느 품종만 매치되는지 확인하세요.\r
    starterCode: iris['species'].str.contains('a').value_counts()\r
    hints:\r
    - sa는 setosa와 versicolor에만, vir은 virginica에만 매치됩니다.\r
    - 결과 True 개수가 매치되는 행 수와 같아야 합니다.\r
  check:\r
    type: noError\r
    noError: str.contains + value_counts 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과 Series의 인덱스가 boolean(True/False)이어야 합니다.\r
- id: step14_duplicated\r
  title: 14단계. 중복 확인\r
  structuredPrimary: true\r
  subtitle: duplicated()\r
  goal: duplicated().sum()으로 완전히 같은 행이 몇 개인지 센다.\r
  why: 같은 데이터가 두 번 들어오면 평균이 왜곡됩니다. 중복 확인은 데이터 정제의 마지막 점검 단계입니다.\r
  explanation: duplicated()는 중복 행을 True로 표시합니다. 첫 번째 발견은 False로 두고 두 번째부터 True로 표시하는 게 기본 동작입니다. sum()으로 True의 개수, 즉 중복 행 수를 셉니다.\r
  tips:\r
  - duplicated(keep=False)는 중복된 모든 행을 True로 표시합니다 - 첫 발견도 포함됩니다.\r
  - duplicated(subset=['species'])처럼 특정 컬럼만 기준으로 중복을 판단할 수도 있습니다.\r
  snippet: iris.duplicated().sum()\r
  exercise:\r
    prompt: duplicated()에 subset=['species']를 추가해 종 컬럼만 기준으로 중복을 세보세요.\r
    starterCode: iris.duplicated().sum()\r
    hints:\r
    - species만 기준으로 하면 150 - 3 = 147개가 중복으로 잡힙니다(각 종 50개 중 첫 번째만 unique).\r
    - 기본(전체 컬럼 기준)은 거의 모든 행이 unique라 중복이 매우 적습니다.\r
  check:\r
    type: noError\r
    noError: duplicated + sum 체인이 정상 실행되어야 합니다.\r
    resultCheck: 결과가 0 이상의 정수여야 합니다.\r
- id: step15_drop_duplicates\r
  title: 15단계. 중복 제거\r
  structuredPrimary: true\r
  subtitle: drop_duplicates()\r
  goal: drop_duplicates()로 중복 행을 제거한 DataFrame을 만들고 원본/결과 길이를 비교한다.\r
  why: duplicated로 발견했다면 제거가 다음 단계입니다. 정제 전후 길이 차이가 중복 제거된 행 수와 같은지 검증하는 습관이 중요합니다.\r
  explanation: drop_duplicates()로 중복 행을 제거합니다. 첫 번째 발견을 남기고 두 번째부터 삭제하는 게 기본입니다. keep='last'로 마지막을 남기거나 keep=False로 모든 중복을 삭제할 수 있습니다.\r
  tips:\r
  - len(iris) - len(unique)가 iris.duplicated().sum()과 같아야 합니다 - 그렇지 않으면 옵션을 잘못 쓴 것입니다.\r
  snippet: |-\r
    unique = iris.drop_duplicates()\r
    len(iris), len(unique)\r
  exercise:\r
    prompt: drop_duplicates에 keep='last'를 추가해 마지막 발견을 남기도록 바꾸고 결과를 head()로 비교하세요.\r
    starterCode: |-\r
      unique = iris.drop_duplicates()\r
      len(iris), len(unique)\r
    hints:\r
    - keep='first'(기본)와 keep='last'는 길이는 같지만 어떤 행이 남는지가 다릅니다.\r
    - keep=False는 중복된 모든 행을 삭제하므로 결과 길이가 가장 짧습니다.\r
  check:\r
    type: noError\r
    noError: drop_duplicates 호출이 정상 실행되어야 합니다.\r
    resultCheck: len(unique) <= len(iris) 관계가 성립해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 붓꽃 데이터 정제와 파생 컬럼'\r
  structuredPrimary: true\r
  subtitle: 결측 처리, apply/map, 중복 제거, 실패 케이스\r
  goal: 합성 3행 DataFrame으로 apply 파생 컬럼, map 치환, drop_duplicates 결과를 assert로 동시에 고정한다.\r
  why: 정제 코드는 한 줄씩 보면 맞아 보여도 전체 흐름이 깨질 수 있습니다. 합성 입력 + assert 조합이 회귀 테스트 역할을 합니다.\r
  explanation: |-\r
    데이터 정제는 값을 채우는 것보다 정제 전후 행 수와 파생 컬럼 의미를 검증하는 것이 중요합니다. 결측, 중복, 분류 컬럼을 한 흐름에서 확인하세요.\r
\r
    변주 실험: 꽃잎 면적 컬럼도 추가하고, 꽃받침 면적과 꽃잎 면적 중 어떤 값이 품종 분리에 더 유용한지 groupby 평균으로 비교하세요.\r
  tips:\r
  - assert가 깨지면 그 줄의 좌변 값을 print로 찍어보고 우변을 새 값으로 갱신하세요.\r
  - apply에 axis=1을 주면 row 단위로 함수가 적용되어 row[컬럼] 접근이 가능합니다.\r
  snippet: |-\r
    import pandas as pd\r
\r
    iris = pd.DataFrame({\r
        "sepal_length": [5.1, 4.9, 5.1],\r
        "sepal_width": [3.5, 3.0, 3.5],\r
        "species": ["setosa", "versicolor", "setosa"],\r
    })\r
\r
    iris["sepal_area"] = iris.apply(lambda row: row["sepal_length"] * row["sepal_width"], axis=1)\r
    iris["species_label"] = iris["species"].map({"setosa": "S", "versicolor": "V"})\r
    unique = iris.drop_duplicates()\r
\r
    assert round(iris.loc[0, "sepal_area"], 2) == 17.85\r
    assert iris["species_label"].tolist() == ["S", "V", "S"]\r
    assert len(unique) == 2\r
  exercise:\r
    prompt: sepal_length 값을 바꾸면 sepal_area assert가 어떻게 깨지는지 확인하고 우변을 새 값으로 갱신하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      iris = pd.DataFrame({\r
          "sepal_length": [5.1, 4.9, 5.1],\r
          "sepal_width": [3.5, 3.0, 3.5],\r
          "species": ["setosa", "versicolor", "setosa"],\r
      })\r
\r
      iris["sepal_area"] = iris.apply(lambda row: row["sepal_length"] * row["sepal_width"], axis=1)\r
      iris["species_label"] = iris["species"].map({"setosa": "S", "versicolor": "V"})\r
      unique = iris.drop_duplicates()\r
\r
      assert round(iris.loc[0, "sepal_area"], 2) == 17.85\r
      assert iris["species_label"].tolist() == ["S", "V", "S"]\r
      assert len(unique) == 2\r
    hints:\r
    - 17.85는 5.1 × 3.5에서 나옵니다.\r
    - drop_duplicates 후 길이 2는 1번째와 3번째 행이 같기 때문입니다.\r
  check:\r
    type: noError\r
    noError: apply/map/drop_duplicates 세 호출이 모두 정상 실행되어야 합니다.\r
    resultCheck: 세 assert가 모두 통과해야 하며, 데이터를 바꾸면 그에 맞춰 우변도 갱신되어야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 붓꽃 분석 프로젝트\r
  goal: 배운 정제 기법(assign + groupby + apply)을 직접 조합해 자신만의 파생 컬럼을 만든다.\r
  why: 가이드 따라가는 학습과 빈 종이에서 시작하는 학습은 다릅니다. 새 가설을 세우고 검증 가능한 컬럼을 추가해봐야 손에 익습니다.\r
  explanation: |-\r
    배운 내용으로 붓꽃 데이터를 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  tips:\r
  - 가설을 한 문장으로 적은 뒤 그에 필요한 컬럼을 assign으로 만들고 groupby로 검증하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset("iris")\r
  exercise:\r
    prompt: data에 sepalRatio = sepal_length / sepal_width 컬럼을 만들고 품종별 평균이 어떻게 다른지 비교하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset("iris")\r
    hints:\r
    - assign(sepalRatio=data['sepal_length'] / data['sepal_width']) 형태입니다.\r
    - 결과에 .groupby('species')['sepalRatio'].mean()을 붙여보세요.\r
  check:\r
    type: noError\r
    noError: loadLocalDataset과 분석 코드가 KeyError 없이 실행되어야 합니다.\r
    resultCheck: 결과가 품종별 평균 Series이거나 새 컬럼이 포함된 DataFrame이어야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 데이터 정제와 새 컬럼 만들기를 배웠습니다.\r
  - type: list\r
    items:\r
    - df.isna().sum() - 결측치 개수 확인\r
    - df.info() - 전체 정보 (타입, 결측치 포함)\r
    - df.dropna() - 결측치 있는 행 삭제\r
    - df.fillna(값) - 결측치 채우기\r
    - df.assign(새컬럼=계산) - 새 컬럼 추가\r
    - 'df[''컬럼''].apply(lambda x: 변환) - 모든 값에 함수 적용'\r
    - 'df[''컬럼''].map({a: b}) - 값 치환'\r
    - df['컬럼'].str.메서드() - 문자열 처리\r
    - df.duplicated() - 중복 행 확인\r
    - df.drop_duplicates() - 중복 제거\r
  - type: text\r
    content: 다음 시간에는 자동차 연비 데이터로 정렬과 피벗테이블을 배웁니다.\r
  goal: 이 강의에서 익힌 결측·파생·apply·map·문자열·중복 10가지 패턴을 머릿속에 정리한다.\r
  why: 같은 패턴이 다음 강의(자동차 연비)와 후속 ML 트랙(sklearn)에서 그대로 반복됩니다. 한 번 정리해두면 다음 강의 진입이 빨라집니다.\r
`;export{e as default};