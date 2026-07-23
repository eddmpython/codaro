var e=`meta:\r
  packages:\r
  - altair\r
  - numpy\r
  - pandas\r
  - plotly\r
  - statsmodels\r
  id: statsmodels_03\r
  title: 의료보험비용예측\r
  order: 3\r
  category: statsmodels\r
  difficulty: ⭐⭐\r
  badge: 입문\r
  dataSource: codaro-local:insurance\r
  tags:\r
  - 로그변환\r
  - 범주형변수\r
  - 더미변수\r
  - 보험료\r
  - 가격책정\r
  seo:\r
    title: statsmodels 로그변환과 범주형변수 - 의료보험 비용 예측\r
    description: 나이, BMI, 흡연 여부로 보험료를 예측합니다. 로그 변환과 범주형 변수 처리를 배웁니다.\r
    keywords:\r
    - statsmodels\r
    - 로그변환\r
    - 범주형변수\r
    - 더미변수\r
    - 보험료예측\r
    - get_dummies\r
intro:\r
  emoji: 🏥\r
  goal: 나이, BMI, 흡연 여부 등으로 의료보험 비용을 예측합니다.\r
  description: 1,338명의 보험 가입자 데이터로 개인 특성에 따른 보험료를 예측합니다. 보험 상품 가격 책정과 리스크 평가에 활용할 수 있습니다.\r
  direction: 의료보험비용예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 의료보험비용예측 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 미리보기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기초 통계량 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 의료보험비용예측 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: altair, numpy, pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 의료보험비용예측 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 의료보험비용예측 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 의료보험 데이터셋\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Insurance 데이터셋은 1,338명의 미국 의료보험 가입자 정보로, 나이, 성별, BMI(체질량지수), 자녀 수, 흡연 여부, 거주 지역, 연간 보험료를\r
    담고 있습니다. 이 데이터로 개인 특성(위험 요인)이 보험료에 미치는 영향을 정량적으로 분석할 수 있으며, charges(보험료)가 예측할 종속변수입니다. 실제 보험사에서는 이런\r
    분석으로 가입자의 리스크를 평가하고 공정한 보험료를 산출하며, 어떤 요인이 의료비 증가에 가장 큰 영향을 미치는지 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    insuranceData = loadLocalDataset("insurance")\r
    insuranceData.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      insuranceData = loadLocalDataset("insurance")\r
      insuranceData.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 데이터 미리보기\r
  structuredPrimary: true\r
  subtitle: 컬럼 구조 확인\r
  goal: 2단계. 데이터 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: 'age(나이), sex(성별: male/female), bmi(체질량지수: 몸무게kg ÷ 키m²), children(피부양 자녀 수), smoker(흡연\r
    여부: yes/no), region(미국 내 거주 지역: southeast, southwest 등), charges(연간 보험료, 달러)가 있습니다. sex, smoker, region은\r
    범주형 변수(카테고리)이고 나머지는 수치형 변수입니다. 범주형 변수는 문자열이므로 그대로 회귀에 사용할 수 없어, get_dummies()로 0/1 더미 변수로 변환해야 합니다.\r
    이 변환 과정은 통계 분석의 필수 전처리 단계입니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: insuranceData.head()\r
  exercise:\r
    prompt: 2단계. 데이터 미리보기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: insuranceData.head()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 미리보기의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 데이터 미리보기 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_describe\r
  title: 3단계. 기초 통계량\r
  structuredPrimary: true\r
  subtitle: 수치형 변수 분포\r
  goal: 3단계. 기초 통계량에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: charges(보험료)의 평균은 약 13,270달러이지만 최대값은 63,770달러로 편차가 매우 큽니다. 표준편차가 12,110달러로 평균에 근접하며, 이는\r
    데이터가 크게 흩어져 있음을 의미합니다. 중앙값(9,382달러)이 평균보다 낮은 것은 분포가 오른쪽으로 치우쳐 있다는(right-skewed) 강력한 신호입니다. 소수의 고위험군(흡연자,\r
    고령자)이 매우 높은 보험료를 내기 때문이며, 이런 비대칭 분포는 로그 변환으로 정규화하면 회귀 모델의 정규성 가정을 만족시켜 R²와 p-value의 정확도가 향상됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: insuranceData.describe()\r
  exercise:\r
    prompt: 3단계. 기초 통계량 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: insuranceData.describe()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기초 통계량의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 기초 통계량 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_hist\r
  title: 4단계. 보험료 분포 확인\r
  structuredPrimary: true\r
  subtitle: 히스토그램\r
  goal: 4단계. 보험료 분포 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    charges(보험료)의 히스토그램을 그리면 오른쪽으로 긴 꼬리를 가진 비대칭 분포(right-skewed distribution)를 확인할 수 있습니다. 히스토그램은 데이터의 분포를 막대 그래프로 나타낸 것으로, 각 막대의 높이는 해당 구간에 속하는 데이터의 개수를 의미합니다. 이 데이터에서 대부분의 사람(약 70%)은 5,000~15,000달러의 낮은 보험료를 내지만, 일부 고위험군(흡연자, 고령자)은 40,000달러 이상의 매우 높은 보험료를 냅니다. 이런 비대칭 분포는 회귀분석의 정규성 가정을 위반하여 모델 성능을 저하시키므로, 로그 변환으로 분포를 대칭에 가깝게 만들어야 합니다. 정규성 가정이 위반되면 p-value가 부정확해지고 신뢰구간이 넓어집니다.\r
\r
    plotly.express의 px.histogram()은 인터랙티브 히스토그램을 그립니다. nbins=30은 30개 구간으로 나눈다는 뜻으로, bins 개수가 많으면 세밀하지만 노이즈가 생기고, 적으면 패턴이 뭉개집니다. labels로 축 이름을 지정하며, 마우스를 올리면 각 막대의 정확한 개수와 범위를 확인할 수 있습니다. 정규분포는 종 모양(bell curve)이지만, 이 데이터는 왼쪽에 치우쳐 오른쪽 꼬리가 긴 형태입니다.\r
  tips:\r
  - plotly.express의 px.histogram()은 인터랙티브 히스토그램을 그립니다. nbins=30은 30개 구간으로 나눈다는 뜻으로, bins 개수가 많으면 세밀하지만\r
    노이즈가 생기고, 적으면 패턴이 뭉개집니다. labels로 축 이름을 지정하며, 마우스를 올리면 각 막대의 정확한 개수와 범위를 확인할 수 있습니다. 정규분포는 종 모양(bell\r
    curve)이지만, 이 데이터는 왼쪽에 치우쳐 오른쪽 꼬리가 긴 형태입니다.\r
  snippet: |-\r
    import plotly.express as px\r
\r
    histFig = px.histogram(insuranceData, x='charges', nbins=30,\r
                           title='Original Distribution of Charges',\r
                           labels={'charges': 'Charges ($)', 'count': 'Frequency'})\r
    histFig.show()\r
  exercise:\r
    prompt: 4단계. 보험료 분포 확인 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
\r
      histFig = px.histogram(insuranceData, x='charges', nbins=30,\r
                             title='Original Distribution of Charges',\r
                             labels={'charges': 'Charges ($)', 'count': 'Frequency'})\r
      histFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 보험료 분포 확인의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 보험료 분포 확인의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_log_transform\r
  title: 5단계. 로그 변환\r
  structuredPrimary: true\r
  subtitle: 분포 정규화\r
  goal: 5단계. 로그 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    로그 변환(logarithmic transformation)은 큰 값을 압축하고 작은 값을 상대적으로 확대하여 비대칭 분포를 대칭에 가깝게 만드는 데이터 변환 기법입니다. numpy의 log() 함수는 자연로그(밑이 e≈2.718인 로그)를 계산하며, 예를 들어 10,000달러는 log(10000)≈9.2, 50,000달러는 log(50000)≈10.8로 변환되어 차이가 40,000에서 1.6으로 줄어듭니다. 로그 변환 후 분포가 종 모양(bell curve)에 가까워지면 회귀 모델의 정규성 가정이 만족되어 R²가 향상되고 p-value가 정확해집니다. 로그 변환은 (1) 비대칭 분포를 대칭화, (2) 이상치(outlier)의 영향 감소, (3) 곱셈 관계를 덧셈 관계로 변환하는 효과가 있어, 금융 데이터(소득, 자산)나 생물학 데이터(세포 수)에서 필수적입니다.\r
\r
    numpy.log()는 자연로그(밑이 e인 로그)를 계산하며, log10()은 상용로그(밑이 10)입니다. plotly의 make_subplots()는 여러 그래프를 나란히 배치하고, add_trace()로 각 위치에 그래프를 추가합니다. row=1, col=1은 첫 번째 위치, row=1, col=2는 두 번째 위치를 의미합니다. 로그 변환 후 오른쪽 그래프가 좌우 대칭에 가까워진 것을 확인할 수 있으며, 이는 회귀 모델의 성능을 크게 향상시킵니다.\r
  tips:\r
  - numpy.log()는 자연로그(밑이 e인 로그)를 계산하며, log10()은 상용로그(밑이 10)입니다. plotly의 make_subplots()는 여러 그래프를 나란히 배치하고,\r
    add_trace()로 각 위치에 그래프를 추가합니다. row=1, col=1은 첫 번째 위치, row=1, col=2는 두 번째 위치를 의미합니다. 로그 변환 후 오른쪽 그래프가\r
    좌우 대칭에 가까워진 것을 확인할 수 있으며, 이는 회귀 모델의 성능을 크게 향상시킵니다.\r
  snippet: |-\r
    import numpy as np\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
\r
    insuranceData['logCharges'] = np.log(insuranceData['charges'])\r
\r
    logCompFig = make_subplots(rows=1, cols=2, subplot_titles=['Original', 'Log Transformed'])\r
    logCompFig.add_trace(go.Histogram(x=insuranceData['charges'], nbinsx=30, name='Original'), row=1, col=1)\r
    logCompFig.add_trace(go.Histogram(x=insuranceData['logCharges'], nbinsx=30, name='Log'), row=1, col=2)\r
    logCompFig.update_xaxes(title_text='Charges ($)', row=1, col=1)\r
    logCompFig.update_xaxes(title_text='Log(Charges)', row=1, col=2)\r
    logCompFig.update_yaxes(title_text='Frequency', row=1, col=1)\r
    logCompFig.update_layout(showlegend=False, title_text='Original vs Log Transformed Distribution')\r
    logCompFig.show()\r
  exercise:\r
    prompt: 5단계. 로그 변환 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
\r
      insuranceData['logCharges'] = np.log(insuranceData['charges'])\r
\r
      logCompFig = make_subplots(rows=1, cols=2, subplot_titles=['Original', 'Log Transformed'])\r
      logCompFig.add_trace(go.Histogram(x=insuranceData['charges'], nbinsx=30, name='Original'), row=1, col=1)\r
      logCompFig.add_trace(go.Histogram(x=insuranceData['logCharges'], nbinsx=30, name='Log'), row=1, col=2)\r
      logCompFig.update_xaxes(title_text='Charges ($)', row=1, col=1)\r
      logCompFig.update_xaxes(title_text='Log(Charges)', row=1, col=2)\r
      logCompFig.update_yaxes(title_text='Frequency', row=1, col=1)\r
      logCompFig.update_layout(showlegend=False, title_text='Original vs Log Transformed Distribution')\r
      logCompFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 로그 변환의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 로그 변환의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_dummies\r
  title: 6단계. 범주형 변수를 더미 변수로 변환\r
  structuredPrimary: true\r
  subtitle: get_dummies()\r
  goal: 6단계. 범주형 변수를 더미 변수로 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    sex, smoker, region은 문자열(male/female, yes/no 등)이므로 회귀에 직접 사용할 수 없습니다. get_dummies()로 0과 1로 이루어진 더미 변수(dummy variable)로 변환합니다. 예를 들어 smoker 컬럼은 smoker_yes(흡연자면 1, 아니면 0)로 변환됩니다. drop_first=True 옵션은 첫 번째 카테고리를 제거하여 다중공선성(multicollinearity)을 방지하며, 예를 들어 sex가 male/female 두 개면 sex_male만 생성하고 sex_female은 생략합니다(sex_female = 1 - sex_male로 완벽히 예측 가능하기 때문).\r
\r
    get_dummies()는 범주형 변수(카테고리)를 더미 변수(dummy variable, 0/1)로 변환하는 pandas 함수입니다. drop_first=True는 다중공선성(multicollinearity)을 방지하기 위해 첫 번째 카테고리를 제거합니다. 예를 들어 sex가 male/female 두 개면 sex_male만 생성하며, 1=남성, 0=여성을 의미합니다. 만약 sex_male과 sex_female을 모두 포함하면 sex_female = 1 - sex_male로 완벽한 선형 관계(완벽한 다중공선성)가 발생하여 역행렬 계산이 불가능해지고 회귀가 실패합니다. k개 카테고리는 k-1개 더미 변수로 충분하며, 제거된 카테고리는 기준(reference) 그룹이 됩니다.\r
  tips:\r
  - get_dummies()는 범주형 변수(카테고리)를 더미 변수(dummy variable, 0/1)로 변환하는 pandas 함수입니다. drop_first=True는 다중공선성(multicollinearity)을\r
    방지하기 위해 첫 번째 카테고리를 제거합니다. 예를 들어 sex가 male/female 두 개면 sex_male만 생성하며, 1=남성, 0=여성을 의미합니다. 만약 sex_male과\r
    sex_female을 모두 포함하면 sex_female = 1 - sex_male로 완벽한 선형 관계(완벽한 다중공선성)가 발생하여 역행렬 계산이 불가능해지고 회귀가 실패합니다.\r
    k개 카테고리는 k-1개 더미 변수로 충분하며, 제거된 카테고리는 기준(reference) 그룹이 됩니다.\r
  snippet: |-\r
    insuranceDummies = pd.get_dummies(insuranceData, columns=['sex', 'smoker', 'region'], drop_first=True, dtype=int)\r
    insuranceDummies.head()\r
  exercise:\r
    prompt: 6단계. 범주형 변수를 더미 변수로 변환 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      insuranceDummies = pd.get_dummies(insuranceData, columns=['sex', 'smoker', 'region'], drop_first=True, dtype=int)\r
      insuranceDummies.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 범주형 변수를 더미 변수로 변환의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 범주형 변수를 더미 변수로 변환의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_xy_split\r
  title: 7단계. X와 y 분리\r
  structuredPrimary: true\r
  subtitle: 독립변수와 종속변수\r
  goal: 7단계. X와 y 분리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    logCharges(로그 변환된 보험료)를 종속변수(y)로, 나머지 특성들을 독립변수(X)로 분리합니다. charges(원본 보험료)와 logCharges는 모두 종속변수이므로 X에서 제외합니다. 01, 02 프로젝트에서 배운 것처럼 회귀분석에서 X(원인)와 y(결과)를 명확히 분리하는 것은 필수입니다. drop() 메서드로 특정 컬럼을 제거하여 깔끔하게 분리할 수 있습니다.\r
\r
    drop()은 컬럼을 제거합니다. axis=1은 컬럼 방향(가로)을 의미합니다. axis=0은 행 방향(세로)입니다. 리스트로 여러 컬럼을 한번에 제거할 수 있습니다.\r
  snippet: |-\r
    y = insuranceDummies['logCharges']\r
    X = insuranceDummies.drop(['charges', 'logCharges'], axis=1)\r
    X.head()\r
  exercise:\r
    prompt: 7단계. X와 y 분리 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      y = insuranceDummies['logCharges']\r
      X = insuranceDummies.drop(['charges', 'logCharges'], axis=1)\r
      X.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. X와 y 분리에서 \`y\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. X와 y 분리 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_add_constant\r
  title: 8단계. 상수항 추가\r
  structuredPrimary: true\r
  subtitle: 절편 계산\r
  goal: 8단계. 상수항 추가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 01, 02 프로젝트에서 배운 것처럼 add_constant()로 절편(intercept)용 컬럼을 추가합니다. 절편은 모든 독립변수가 0일 때의 기본 보험료를\r
    의미하며, 회귀식 y = β₀ + β₁X₁ + β₂X₂ + ...에서 β₀에 해당합니다. statsmodels는 sklearn과 달리 절편을 자동으로 추가하지 않으므로 이 단계가\r
    필수이며, 모든 회귀 모델(OLS, Logit, ARIMA 등)에 동일하게 적용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: XWithConst = sm.add_constant(X)\r
  exercise:\r
    prompt: 8단계. 상수항 추가 예제에서 \`XWithConst\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: XWithConst = sm.add_constant(X)\r
    hints:\r
    - 바꿀 지점은 \`XWithConst = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`XWithConst\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 상수항 추가에서 \`XWithConst\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 상수항 추가 실행 뒤 \`XWithConst\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_fit_model\r
  title: 9단계. 회귀 모델 학습\r
  structuredPrimary: true\r
  subtitle: 로그 보험료 예측\r
  goal: 9단계. 회귀 모델 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: OLS(y, X).fit()으로 모델을 학습합니다. 종속변수가 logCharges(로그 변환된 보험료)이므로 예측값도 로그 스케일입니다. 로그 스케일은 log()\r
    함수를 적용한 값으로, 예를 들어 10,000달러는 log(10000) ≈ 9.2로 표현됩니다. 나중에 실제 보험료(달러 단위)로 변환하려면 로그의 역함수인 exp() 지수 함수를\r
    적용해야 합니다. exp(9.2) ≈ 10,000처럼 원래 값으로 되돌립니다. fit()은 01 프로젝트에서 배운 것처럼 최소제곱법으로 계수를 계산하는 과정입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: model = sm.OLS(y, XWithConst).fit()\r
  exercise:\r
    prompt: 9단계. 회귀 모델 학습 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: model = sm.OLS(y, XWithConst).fit()\r
    hints:\r
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 회귀 모델 학습에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 회귀 모델 학습 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step10_summary\r
  title: 10단계. 결과 요약\r
  structuredPrimary: true\r
  subtitle: summary 해석\r
  goal: 10단계. 결과 요약에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    R²는 약 0.75로, 선택한 변수들이 로그 보험료 변동의 75%를 설명합니다. 주목할 점은 smoker_yes의 계수가 1.51로 가장 크며, p-value가 0.000으로 통계적으로 매우 유의미합니다. 이는 흡연이 보험료에 압도적으로 큰 영향을 미친다는 강력한 증거입니다. age(나이)와 bmi(체질량지수)도 유의미한 양의 계수를 가지며, 나이가 많고 BMI가 높을수록 보험료가 증가합니다. 이 결과는 보험사의 위험 평가 기준과 일치합니다.\r
\r
    로그 변환된 종속변수의 계수는 백분율 변화로 해석하며, 이는 일반 회귀와 다른 중요한 차이입니다. smoker_yes 계수가 1.51이면 exp(1.51) ≈ 4.53으로 변환하고, 흡연자는 비흡연자보다 보험료가 (4.53 - 1) × 100 = 353% 높다는 뜻입니다. 수식으로 설명하면 log(Y) = β₀ + β₁X 모델에서 β₁의 의미는 X가 1 증가할 때 Y가 exp(β₁)배 변한다는 것입니다. 예를 들어 age 계수가 0.034이면 나이 1세 증가 시 보험료는 exp(0.034) ≈ 1.035배, 즉 3.5% 증가합니다. 이 해석 방법은 경제학과 금융에서 널리 사용되며, 소득, 가격, 수익률 등 곱셈 효과가 있는 변수에 적합합니다.\r
  tips:\r
  - 로그 변환된 종속변수의 계수는 백분율 변화로 해석하며, 이는 일반 회귀와 다른 중요한 차이입니다. smoker_yes 계수가 1.51이면 exp(1.51) ≈ 4.53으로 변환하고,\r
    흡연자는 비흡연자보다 보험료가 (4.53 - 1) × 100 = 353% 높다는 뜻입니다. 수식으로 설명하면 log(Y) = β₀ + β₁X 모델에서 β₁의 의미는 X가 1 증가할\r
    때 Y가 exp(β₁)배 변한다는 것입니다. 예를 들어 age 계수가 0.034이면 나이 1세 증가 시 보험료는 exp(0.034) ≈ 1.035배, 즉 3.5% 증가합니다.\r
    이 해석 방법은 경제학과 금융에서 널리 사용되며, 소득, 가격, 수익률 등 곱셈 효과가 있는 변수에 적합합니다.\r
  snippet: model.summary()\r
  exercise:\r
    prompt: 10단계. 결과 요약 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: model.summary()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 결과 요약의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 10단계. 결과 요약 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step11_residual_plot\r
  title: 11단계. 잔차 분석\r
  structuredPrimary: true\r
  subtitle: 모델 진단\r
  goal: 11단계. 잔차 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    02 프로젝트에서 배운 잔차 플롯으로 로그 변환 모델의 적합성을 진단합니다. 로그 변환 전에는 잔차가 깔때기 모양이었다면, 변환 후에는 더 균일하게 분포해야 합니다. 잔차가 0 주변에 무작위로 흩어져 있으면 좋은 모델입니다.\r
\r
    로그 변환 후 잔차가 더 균일하게 분포한다면 변환이 효과적이라는 증거입니다. 깔때기 모양(이분산성)이 사라졌는지 확인하세요.\r
  snippet: |-\r
    import altair as alt\r
\r
    residDf = pd.DataFrame({\r
        'fitted': model.fittedvalues,\r
        'residual': model.resid\r
    })\r
    residChart = alt.Chart(residDf).mark_circle(size=40, opacity=0.5).encode(\r
        x=alt.X('fitted:Q', title='Fitted Values (Log Scale)'),\r
        y=alt.Y('residual:Q', title='Residuals'),\r
        tooltip=['fitted', 'residual']\r
    ).properties(width=500, height=300, title='Residual Plot - Log Model')\r
\r
    zeroRule = alt.Chart(pd.DataFrame({'y': [0]})).mark_rule(color='red', strokeDash=[5, 5]).encode(y='y:Q')\r
    residChart + zeroRule\r
  exercise:\r
    prompt: 11단계. 잔차 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
\r
      residDf = pd.DataFrame({\r
          'fitted': model.fittedvalues,\r
          'residual': model.resid\r
      })\r
      residChart = alt.Chart(residDf).mark_circle(size=40, opacity=0.5).encode(\r
          x=alt.X('fitted:Q', title='Fitted Values (Log Scale)'),\r
          y=alt.Y('residual:Q', title='Residuals'),\r
          tooltip=['fitted', 'residual']\r
      ).properties(width=500, height=300, title='Residual Plot - Log Model')\r
\r
      zeroRule = alt.Chart(pd.DataFrame({'y': [0]})).mark_rule(color='red', strokeDash=[5, 5]).encode(y='y:Q')\r
      residChart + zeroRule\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 잔차 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 잔차 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_coef_viz\r
  title: 12단계. 계수 시각화\r
  structuredPrimary: true\r
  subtitle: 영향력 비교\r
  goal: 12단계. 계수 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    계수를 막대 그래프로 시각화하면 각 변수의 영향력을 직관적으로 비교할 수 있습니다. 로그 모델에서 계수는 백분율 변화를 의미하므로, smoker_yes의 큰 계수는 흡연이 보험료에 압도적인 영향을 미친다는 것을 시각적으로 보여줍니다.\r
\r
    녹색은 양의 계수(보험료 증가), 빨간색은 음의 계수(보험료 감소)입니다. smoker_yes가 다른 변수보다 압도적으로 크다는 것을 한눈에 알 수 있습니다.\r
  snippet: |-\r
    coefData = model.params.drop('const').reset_index()\r
    coefData.columns = ['variable', 'coefficient']\r
    coefData['abs_coef'] = coefData['coefficient'].abs()\r
    coefData = coefData.sort_values('abs_coef', ascending=False)\r
\r
    coefChart = alt.Chart(coefData).mark_bar().encode(\r
        x=alt.X('coefficient:Q', title='Coefficient'),\r
        y=alt.Y('variable:N', sort='-x', title='Variable'),\r
        color=alt.condition(\r
            alt.datum.coefficient > 0,\r
            alt.value('#2ecc71'),\r
            alt.value('#e74c3c')\r
        ),\r
        tooltip=['variable', 'coefficient']\r
    ).properties(width=400, height=300, title='Regression Coefficients (Log Model)')\r
    coefChart\r
  exercise:\r
    prompt: 12단계. 계수 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      coefData = model.params.drop('const').reset_index()\r
      coefData.columns = ['variable', 'coefficient']\r
      coefData['abs_coef'] = coefData['coefficient'].abs()\r
      coefData = coefData.sort_values('abs_coef', ascending=False)\r
\r
      coefChart = alt.Chart(coefData).mark_bar().encode(\r
          x=alt.X('coefficient:Q', title='Coefficient'),\r
          y=alt.Y('variable:N', sort='-x', title='Variable'),\r
          color=alt.condition(\r
              alt.datum.coefficient > 0,\r
              alt.value('#2ecc71'),\r
              alt.value('#e74c3c')\r
          ),\r
          tooltip=['variable', 'coefficient']\r
      ).properties(width=400, height=300, title='Regression Coefficients (Log Model)')\r
      coefChart\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 계수 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. 계수 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step13_top_coefficients\r
  title: 13단계. 주요 영향 요인\r
  structuredPrimary: true\r
  subtitle: 계수 크기 비교\r
  goal: 13단계. 주요 영향 요인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 계수의 절대값이 클수록 로그 보험료(즉 백분율 변화)에 미치는 영향이 큽니다. smoker_yes(1.51), age(0.034), bmi(0.013) 순으로\r
    영향력이 큽니다. 로그 모델에서 계수는 백분율 변화로 해석하며, smoker_yes 1.51은 흡연자가 비흡연자보다 exp(1.51) ≈ 4.5배, 즉 약 350% 높은 보험료를\r
    낸다는 의미입니다. 이 분석으로 보험사는 흡연자 할증률을 정당화하고, 가입자는 금연의 경제적 이점을 이해할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    coefficients = model.params.drop('const')\r
    coefficients.abs().sort_values(ascending=False).head(5)\r
  exercise:\r
    prompt: 13단계. 주요 영향 요인 예제에서 \`coefficients\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      coefficients = model.params.drop('const')\r
      coefficients.abs().sort_values(ascending=False).head(5)\r
    hints:\r
    - 바꿀 지점은 \`coefficients = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`coefficients\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 주요 영향 요인에서 \`coefficients\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 주요 영향 요인 실행 뒤 \`coefficients\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step14_predict_log\r
  title: 14단계. 로그 보험료 예측\r
  structuredPrimary: true\r
  subtitle: 새로운 사람 입력\r
  goal: 14단계. 로그 보험료 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 30세, 남성, BMI 25, 자녀 1명, 비흡연자, southeast 지역인 사람의 로그 보험료를 예측합니다. 더미 변수는 해당 조건에 맞으면 1, 아니면\r
    0으로 입력합니다. 예를 들어 sex_male=1(남성), smoker_yes=0(비흡연자), region_southeast=0(southeast가 아님, drop_first로\r
    제거됨)입니다. 01, 02 프로젝트에서 배운 predict() 사용법을 적용하며, 학습 데이터와 동일한 컬럼 순서와 이름을 맞춰야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    newPersonData = {col: [0] for col in X.columns}\r
    newPersonData['age'] = [30]\r
    newPersonData['bmi'] = [25]\r
    newPersonData['children'] = [1]\r
    newPersonData['sex_male'] = [1]\r
\r
    newPerson = pd.DataFrame(newPersonData)[X.columns]\r
    newPersonWithConst = sm.add_constant(newPerson, has_constant='add')\r
    logPredicted = model.predict(newPersonWithConst)[0]\r
    f"예측 로그 보험료: {logPredicted:.3f}"\r
  exercise:\r
    prompt: 14단계. 로그 보험료 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      newPersonData = {col: [0] for col in X.columns}\r
      newPersonData['age'] = [30]\r
      newPersonData['bmi'] = [25]\r
      newPersonData['children'] = [1]\r
      newPersonData['sex_male'] = [1]\r
\r
      newPerson = pd.DataFrame(newPersonData)[X.columns]\r
      newPersonWithConst = sm.add_constant(newPerson, has_constant='add')\r
      logPredicted = model.predict(newPersonWithConst)[0]\r
      f"예측 로그 보험료: {logPredicted:.3f}"\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 로그 보험료 예측의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 14단계. 로그 보험료 예측 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step15_predict_actual\r
  title: 15단계. 실제 보험료로 변환\r
  structuredPrimary: true\r
  subtitle: 지수 함수 적용\r
  goal: 15단계. 실제 보험료로 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    로그 보험료를 실제 달러 단위 보험료로 변환하려면 지수 함수 exp()를 적용합니다. log()와 exp()는 역함수 관계로, exp(log(x)) = x가 성립합니다. 예를 들어 예측된 로그 보험료가 8.5이면 exp(8.5) ≈ 4,914달러가 실제 예상 연간 보험료입니다. 이 변환은 비즈니스에서 실제 금액을 산출할 때 필수이며, 로그 모델의 최종 결과물입니다.\r
\r
    numpy.exp()는 자연상수 e(≈2.718)의 거듭제곱을 계산하는 지수 함수입니다. exp(x)는 e^x를 의미하며, 예를 들어 exp(2) = e² ≈ 7.39입니다. log()와 exp()는 역함수 관계로, exp(log(x)) = x가 성립하여 서로 상쇄됩니다. 로그 변환 후 회귀한 경우 예측값이 로그 스케일이므로 반드시 exp()로 원래 스케일(실제 보험료)로 되돌려야 비즈니스에서 사용할 수 있습니다. np는 numpy를 짧게 줄인 별칭으로, import numpy as np로 선언했기 때문에 사용 가능합니다.\r
  tips:\r
  - numpy.exp()는 자연상수 e(≈2.718)의 거듭제곱을 계산하는 지수 함수입니다. exp(x)는 e^x를 의미하며, 예를 들어 exp(2) = e² ≈ 7.39입니다.\r
    log()와 exp()는 역함수 관계로, exp(log(x)) = x가 성립하여 서로 상쇄됩니다. 로그 변환 후 회귀한 경우 예측값이 로그 스케일이므로 반드시 exp()로 원래\r
    스케일(실제 보험료)로 되돌려야 비즈니스에서 사용할 수 있습니다. np는 numpy를 짧게 줄인 별칭으로, import numpy as np로 선언했기 때문에 사용 가능합니다.\r
  snippet: |-\r
    actualPredicted = np.exp(logPredicted)\r
    f"예측 보험료: \${actualPredicted:.2f}"\r
  exercise:\r
    prompt: 15단계. 실제 보험료로 변환 예제에서 \`actualPredicted\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      actualPredicted = np.exp(logPredicted)\r
      f"예측 보험료: \${actualPredicted:.2f}"\r
    hints:\r
    - 바꿀 지점은 \`actualPredicted = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`actualPredicted\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 실제 보험료로 변환에서 \`actualPredicted\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. 실제 보험료로 변환 실행 뒤 \`actualPredicted\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step16_smoker_comparison\r
  title: 16단계. 흡연자 vs 비흡연자\r
  structuredPrimary: true\r
  subtitle: 흡연 효과 비교\r
  goal: 16단계. 흡연자 vs 비흡연자에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 같은 조건(나이, 성별, BMI, 자녀 수, 지역)에서 흡연 여부만 바꿔서 보험료 차이를 확인합니다. 다른 변수는 고정하고 smoker_yes만 0에서 1로\r
    바꾸면 순수한 흡연 효과를 정량적으로 측정할 수 있습니다. 02 프로젝트에서 배운 '다른 변수 고정 시 순수 효과' 개념을 적용하며, 이는 인과관계 분석의 핵심입니다. 결과적으로\r
    흡연자는 비흡연자보다 약 3~4배 높은 보험료를 내며, 이 수치는 보험사의 흡연자 할증률 결정에 직접 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    newPersonSmoker = newPerson.copy()\r
    newPersonSmoker['smoker_yes'] = 1\r
\r
    newPersonSmokerConst = sm.add_constant(newPersonSmoker, has_constant='add')\r
\r
    nonSmokerCharge = np.exp(model.predict(newPersonWithConst)[0])\r
    smokerCharge = np.exp(model.predict(newPersonSmokerConst)[0])\r
\r
    f"비흡연자 보험료: \${nonSmokerCharge:.2f}"\r
    f"흡연자 보험료: \${smokerCharge:.2f}"\r
    f"차이: \${smokerCharge - nonSmokerCharge:.2f}"\r
    f"비율: {smokerCharge / nonSmokerCharge:.2f}배"\r
  exercise:\r
    prompt: 16단계. 흡연자 vs 비흡연자 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      newPersonSmoker = newPerson.copy()\r
      newPersonSmoker['smoker_yes'] = 1\r
\r
      newPersonSmokerConst = sm.add_constant(newPersonSmoker, has_constant='add')\r
\r
      nonSmokerCharge = np.exp(model.predict(newPersonWithConst)[0])\r
      smokerCharge = np.exp(model.predict(newPersonSmokerConst)[0])\r
\r
      f"비흡연자 보험료: \${nonSmokerCharge:.2f}"\r
      f"흡연자 보험료: \${smokerCharge:.2f}"\r
      f"차이: \${smokerCharge - nonSmokerCharge:.2f}"\r
      f"비율: {smokerCharge / nonSmokerCharge:.2f}배"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 16단계. 흡연자 vs 비흡연자에서 \`newPersonSmoker\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 16단계. 흡연자 vs 비흡연자 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 보험료 책정 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    보험사 리스크 분석가가 되어 개인 특성별 보험료를 책정해봅시다. 각 미션은 데이터 로딩부터 로그 변환, 범주형 처리, 모델링, 예측까지 전체 과정을 독립적으로 수행합니다. 01 프로젝트의 OLS와 summary, 02 프로젝트의 다중회귀와 잔차 분석, 그리고 이번 프로젝트의 로그 변환과 범주형 변수 처리를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    import numpy as np\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    logData = loadLocalDataset("insurance")\r
    logData.shape\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      import numpy as np\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      logData = loadLocalDataset("insurance")\r
      logData.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 세 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 의료보험 데이터로 나이, BMI, 흡연 여부 등으로 보험료를 예측했습니다. 로그 변환으로 비대칭 분포를 정규화하여 R² 0.75를 달성했고,\r
      get_dummies()로 범주형 변수를 처리했습니다. 흡연자는 비흡연자보다 보험료가 약 3.5배 높다는 것을 확인했으며, 이 모델로 개인별 공정한 보험료를 책정하고 리스크\r
      요인을 파악할 수 있습니다.\r
  - type: list\r
    items:\r
    - 로그 변환 - 비대칭 분포를 정규화하여 모델 성능 개선\r
    - get_dummies() - 범주형 변수를 0/1 더미 변수로 변환\r
    - drop_first=True - 다중공선성 방지\r
    - exp() - 로그 예측값을 실제값으로 변환\r
    - 계수 해석 - 로그 모델은 백분율 변화\r
    - 요인 비교 - 다른 변수 고정 시 순수 효과 측정\r
  - type: text\r
    content: 다음 프로젝트에서는 항공 수요 데이터로 시계열 분석을 시작합니다. ARIMA 모델로 월별 승객 수를 예측하고 계절성을 분해해봅니다.\r
  goal: 정리에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 회귀 리포트 품질 게이트\r
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: statsmodels 학습의 핵심은 모델을 만들고 summary를 보는 데서 끝나지 않는 것입니다. 먼저 어떤 변수가 유의할지 예측하고, 로컬 데이터의 컬럼과\r
    결측치를 검증하고, 회귀 결과가 보고서에 들어갈 수준인지 R², F-test, 잔차 진단으로 확인해야 합니다. 마지막에는 변수를 빼는 변주로 모델 선택의 근거를 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from statsmodels.stats.diagnostic import het_breuschpagan\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    marketingData = loadLocalDataset("advertising")\r
    requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]\r
\r
    missingColumns = [column for column in requiredColumns if column not in marketingData.columns]\r
    if missingColumns:\r
        raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")\r
    if marketingData[requiredColumns].isna().any().any():\r
        raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")\r
\r
    reportY = marketingData["Sales"]\r
    reportX = sm.add_constant(marketingData[["TV", "Radio", "Newspaper"]])\r
    reportModel = sm.OLS(reportY, reportX).fit()\r
\r
    marketingData[requiredColumns].head()\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      compactX = sm.add_constant(marketingData[["TV", "Radio"]])\r
      compactModel = sm.OLS(reportY, compactX).fit()\r
      r2Drop = reportModel.rsquared - compactModel.rsquared\r
\r
      assert compactModel.rsquared >= 0.95\r
      {\r
          "fullR2": round(reportModel.rsquared, 3),\r
          "compactR2": round(compactModel.rsquared, 3),\r
          "r2Drop": round(r2Drop, 3),\r
          "fullAIC": round(reportModel.aic, 1),\r
          "compactAIC": round(compactModel.aic, 1),\r
      }\r
    solution: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from statsmodels.stats.diagnostic import het_breuschpagan\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      marketingData = loadLocalDataset("advertising")\r
      requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]\r
\r
      missingColumns = [column for column in requiredColumns if column not in marketingData.columns]\r
      if missingColumns:\r
          raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")\r
      if marketingData[requiredColumns].isna().any().any():\r
          raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")\r
\r
      marketingData[requiredColumns].head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`compactX\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};