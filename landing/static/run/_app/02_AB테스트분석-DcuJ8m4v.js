var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_02\r
  title: AB테스트분석\r
  order: 2\r
  category: scipy\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - scipy.stats\r
  - t-test\r
  - 가설검정\r
  - p-value\r
  - AB테스트\r
  seo:\r
    title: scipy.stats t-검정 - A/B 테스트 분석하기\r
    description: scipy.stats의 ttest_ind로 A/B 테스트를 분석합니다. p-value를 해석하고 통계적 유의성을 판단합니다.\r
    keywords:\r
    - scipy\r
    - t-test\r
    - AB테스트\r
    - 가설검정\r
    - p-value\r
intro:\r
  emoji: 🧪\r
  goal: 이커머스 버튼 색상 A/B 테스트 결과를 분석하여 비즈니스 의사결정을 내립니다.\r
  description: 마케팅팀에서 구매 버튼 색상을 파란색에서 녹색으로 바꾸면 매출이 올라갈지 테스트했습니다. Control 그룹(파란 버튼)과 Treatment 그룹(녹색 버튼)\r
    각 1000명의 구매 금액 데이터가 있습니다. 평균 차이가 $3인데, 이것이 우연인지 실제 효과인지 어떻게 판단할까요? scipy.stats의 t-검정으로 통계적 유의성을 판단하고,\r
    효과 크기와 신뢰구간까지 분석하여 최종 권고안을 제시합니다.\r
  direction: AB테스트분석에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - AB테스트분석 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 및 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 데이터 탐색 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: t검정 실행 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: AB테스트분석 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: AB테스트분석 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: AB테스트분석 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 및 데이터 로드\r
  structuredPrimary: true\r
  subtitle: scipy.stats\r
  goal: 라이브러리 및 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    A/B 테스트는 두 버전을 무작위로 배정하여 어느 것이 더 효과적인지 비교하는 실험입니다. 웹사이트 버튼 색상, 이메일 제목, 가격 정책 등 다양한 요소를 테스트할 수 있습니다. scipy.stats의 ttest_ind 함수는 두 독립 표본의 평균 차이가 통계적으로 유의미한지 검정합니다. 이 프로젝트에서는 가상의 이커머스 A/B 테스트 데이터를 생성하여 분석합니다.\r
\r
    Control 그룹은 기존 버전(파란 버튼), Treatment 그룹은 새 버전(녹색 버튼)입니다. 평균 차이 $3가 실제 효과인지 우연인지 통계적으로 판단합니다.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import stats\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    np.random.seed(42)\r
    controlGroup = np.random.normal(loc=50, scale=15, size=1000)\r
    treatmentGroup = np.random.normal(loc=53, scale=15, size=1000)\r
  exercise:\r
    prompt: 라이브러리 및 데이터 로드 예제에서 \`controlGroup\`, \`treatmentGroup\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import stats\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      np.random.seed(42)\r
      controlGroup = np.random.normal(loc=50, scale=15, size=1000)\r
      treatmentGroup = np.random.normal(loc=53, scale=15, size=1000)\r
    hints:\r
    - 바꿀 지점은 \`controlGroup = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`controlGroup\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 및 데이터 로드에서 \`controlGroup\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 라이브러리 및 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: explore\r
  title: 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 분포 시각화\r
  goal: 데이터 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 통계 검정 전에 데이터를 시각화하여 직관적으로 파악합니다. 두 그룹의 히스토그램을 겹쳐 그리면 분포의 중심과 퍼짐을 비교할 수 있습니다. 평균의 차이가 눈에\r
    보이지만, 분포가 많이 겹치므로 통계적 검정이 필요합니다. 기술통계량(평균, 표준편차)도 함께 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summaryDf = pd.DataFrame({\r
        'Group': ['Control', 'Treatment'],\r
        'Mean': [controlGroup.mean(), treatmentGroup.mean()],\r
        'Std': [controlGroup.std(), treatmentGroup.std()],\r
        'Min': [controlGroup.min(), treatmentGroup.min()],\r
        'Max': [controlGroup.max(), treatmentGroup.max()]\r
    })\r
    summaryDf\r
  exercise:\r
    prompt: 데이터 탐색 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summaryDf = pd.DataFrame({\r
          'Group': ['Control', 'Treatment'],\r
          'Mean': [controlGroup.mean(), treatmentGroup.mean()],\r
          'Std': [controlGroup.std(), treatmentGroup.std()],\r
          'Min': [controlGroup.min(), treatmentGroup.min()],\r
          'Max': [controlGroup.max(), treatmentGroup.max()]\r
      })\r
      summaryDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 탐색의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 데이터 탐색의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: ttest\r
  title: t-검정 실행\r
  structuredPrimary: true\r
  subtitle: ttest_ind\r
  goal: t검정 실행에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    t-검정은 두 그룹의 평균 차이가 우연으로 발생했을 확률을 계산합니다. 귀무가설(H0)은 '두 그룹에 차이가 없다'입니다. p-value가 유의수준(보통 0.05) 미만이면 귀무가설을 기각하고, 실제 차이가 있다고 결론 내립니다. ttest_ind는 독립표본 t-검정으로, 서로 다른 사람들로 구성된 두 그룹을 비교할 때 사용합니다.\r
\r
    t통계량은 평균 차이를 표준오차로 나눈 값입니다. 절대값이 클수록 차이가 크다는 의미입니다. p-value는 귀무가설이 참일 때 이 정도 차이가 우연히 나올 확률입니다.\r
  snippet: |-\r
    tStat, pValue = stats.ttest_ind(controlGroup, treatmentGroup)\r
    tStat, pValue\r
  exercise:\r
    prompt: t검정 실행 예제에서 \`tStat\`, \`pValue\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      tStat, pValue = stats.ttest_ind(controlGroup, treatmentGroup)\r
      tStat, pValue\r
    hints:\r
    - 바꿀 지점은 수치 입력을 만드는 첫 줄과 최적화/적분/신호 처리 줄에서 찾으세요.\r
    - 실행 뒤 오차와 결과 범위 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: t검정 실행에서 \`tStat\`, \`pValue\` 할당 개수와 값 순서가 맞아야 합니다.\r
    resultCheck: t검정 실행 실행 결과가 오차와 결과 범위 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: effect_size\r
  title: 효과 크기 분석\r
  structuredPrimary: true\r
  subtitle: Cohen's d\r
  goal: 효과 크기 분석에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    Cohen's d는 두 그룹 평균 차이를 표준편차 단위로 표현합니다. d가 0.2면 작은 효과, 0.5면 중간 효과, 0.8 이상이면 큰 효과로 해석합니다. p-value가 유의미해도 효과 크기가 작으면 실무적 가치가 낮을 수 있습니다. 반대로 효과 크기가 커도 샘플이 작으면 p-value가 유의미하지 않을 수 있습니다. 두 지표를 함께 보는 것이 중요합니다.\r
\r
    실무에서 Cohen's d가 0.2 미만이면 효과가 미미하여 변경 비용 대비 가치가 낮을 수 있습니다. 통계적 유의성과 실무적 유의성은 다른 개념입니다.\r
  snippet: |-\r
    pooledStd = np.sqrt((controlGroup.std()**2 + treatmentGroup.std()**2) / 2)\r
    cohensD = (treatmentGroup.mean() - controlGroup.mean()) / pooledStd\r
\r
    def interpretEffect(d):\r
        absD = abs(d)\r
        if absD < 0.2:\r
            return "negligible"\r
        elif absD < 0.5:\r
            return "small"\r
        elif absD < 0.8:\r
            return "medium"\r
        else:\r
            return "large"\r
\r
    effectInterpret = interpretEffect(cohensD)\r
    cohensD, effectInterpret\r
  exercise:\r
    prompt: 효과 크기 분석 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      pooledStd = np.sqrt((controlGroup.std()**2 + treatmentGroup.std()**2) / 2)\r
      cohensD = (treatmentGroup.mean() - controlGroup.mean()) / pooledStd\r
\r
      def interpretEffect(d):\r
          absD = abs(d)\r
          if absD < 0.2:\r
              return "negligible"\r
          elif absD < 0.5:\r
              return "small"\r
          elif absD < 0.8:\r
              return "medium"\r
          else:\r
              return "large"\r
\r
      effectInterpret = interpretEffect(cohensD)\r
      cohensD, effectInterpret\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 효과 크기 분석의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 효과 크기 분석 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: confidence\r
  title: 신뢰구간 분석\r
  structuredPrimary: true\r
  subtitle: 95% CI\r
  goal: 신뢰구간 분석에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 95% 신뢰구간은 모집단의 실제 평균 차이가 95% 확률로 포함되는 범위입니다. 신뢰구간이 0을 포함하지 않으면 통계적으로 유의미합니다. 신뢰구간의 너비는\r
    추정의 정밀도를 나타냅니다. 좁을수록 더 정확한 추정입니다. 비즈니스 보고서에서는 p-value보다 신뢰구간이 더 직관적인 경우가 많습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    meanDiff = treatmentGroup.mean() - controlGroup.mean()\r
    seDiff = np.sqrt(controlGroup.var()/len(controlGroup) + treatmentGroup.var()/len(treatmentGroup))\r
    ciLower = meanDiff - 1.96 * seDiff\r
    ciUpper = meanDiff + 1.96 * seDiff\r
\r
    ciDf = pd.DataFrame({\r
        'Metric': ['Mean Difference', '95% CI Lower', '95% CI Upper', 'Contains Zero'],\r
        'Value': [f'\${meanDiff:.2f}', f'\${ciLower:.2f}', f'\${ciUpper:.2f}', 'No' if ciLower > 0 or ciUpper < 0 else 'Yes']\r
    })\r
    ciDf\r
  exercise:\r
    prompt: 신뢰구간 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      meanDiff = treatmentGroup.mean() - controlGroup.mean()\r
      seDiff = np.sqrt(controlGroup.var()/len(controlGroup) + treatmentGroup.var()/len(treatmentGroup))\r
      ciLower = meanDiff - 1.96 * seDiff\r
      ciUpper = meanDiff + 1.96 * seDiff\r
\r
      ciDf = pd.DataFrame({\r
          'Metric': ['Mean Difference', '95% CI Lower', '95% CI Upper', 'Contains Zero'],\r
          'Value': [f'\${meanDiff:.2f}', f'\${ciLower:.2f}', f'\${ciUpper:.2f}', 'No' if ciLower > 0 or ciUpper < 0 else 'Yes']\r
      })\r
      ciDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 신뢰구간 분석의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 신뢰구간 분석 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: result\r
  title: 최종 분석 보고서\r
  structuredPrimary: true\r
  subtitle: 비즈니스 의사결정\r
  goal: 최종 분석 보고서에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: A/B 테스트 분석 결과를 종합하여 비즈니스 의사결정을 내립니다. 통계적 유의성(p-value), 효과 크기(Cohen's d), 신뢰구간을 모두 고려합니다.\r
    단순히 p < 0.05라고 바로 채택하는 것이 아니라, 효과 크기가 실무적으로 의미 있는지, 구현 비용 대비 가치가 있는지도 함께 판단해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    reportDf = pd.DataFrame({\r
        'Metric': [\r
            'Control Mean',\r
            'Treatment Mean',\r
            'Difference',\r
            'Effect Size',\r
            'p-value',\r
            'Significant (α=0.05)',\r
            '95% CI',\r
            'Recommendation'\r
        ],\r
        'Value': [\r
            f'\${controlGroup.mean():.2f}',\r
            f'\${treatmentGroup.mean():.2f}',\r
            f'\${meanDiff:.2f} (+{meanDiff/controlGroup.mean()*100:.1f}%)',\r
            f'{cohensD:.3f} ({effectInterpret})',\r
            f'{pValue:.6f}',\r
            'Yes' if pValue < 0.05 else 'No',\r
            f'[\${ciLower:.2f}, \${ciUpper:.2f}]',\r
            'Implement Treatment' if pValue < 0.05 and cohensD > 0.1 else 'Keep Control'\r
        ]\r
    })\r
    reportDf\r
  exercise:\r
    prompt: 최종 분석 보고서 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      reportDf = pd.DataFrame({\r
          'Metric': [\r
              'Control Mean',\r
              'Treatment Mean',\r
              'Difference',\r
              'Effect Size',\r
              'p-value',\r
              'Significant (α=0.05)',\r
              '95% CI',\r
              'Recommendation'\r
          ],\r
          'Value': [\r
              f'\${controlGroup.mean():.2f}',\r
              f'\${treatmentGroup.mean():.2f}',\r
              f'\${meanDiff:.2f} (+{meanDiff/controlGroup.mean()*100:.1f}%)',\r
              f'{cohensD:.3f} ({effectInterpret})',\r
              f'{pValue:.6f}',\r
              'Yes' if pValue < 0.05 else 'No',\r
              f'[\${ciLower:.2f}, \${ciUpper:.2f}]',\r
              'Implement Treatment' if pValue < 0.05 and cohensD > 0.1 else 'Keep Control'\r
          ]\r
      })\r
      reportDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 최종 분석 보고서의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 최종 분석 보고서 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: workflow_validation\r
  title: 실무 A/B 테스트 의사결정 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 확인 → 통계 검증 → 기준 실험\r
  goal: 실무 A/B 테스트 의사결정 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: A/B 테스트는 p-value 하나로 끝내면 위험합니다. 데이터가 비어 있거나 NaN이 섞인 상태를 먼저 막고, 평균 차이·신뢰구간·효과 크기·최소 실무 효과\r
    기준을 함께 봐야 합니다. 이번 단계에서는 Treatment가 Control보다 높을 것이라고 먼저 예상하고, 잘못된 입력을 일부러 실패시킵니다. 그다음 검증 가능한 분석 함수를\r
    만들고, 최소 기대 매출 상승 기준을 바꿔 채택 판단이 어떻게 달라지는지 실험합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def validateAbSamples(control, treatment):\r
        control = np.asarray(control, dtype=float)\r
        treatment = np.asarray(treatment, dtype=float)\r
\r
        if len(control) < 2 or len(treatment) < 2:\r
            raise ValueError("각 그룹에는 최소 2개 이상의 관측값이 필요합니다.")\r
        if np.isnan(control).any() or np.isnan(treatment).any():\r
            raise ValueError("A/B 테스트 표본에 결측값이 있으면 먼저 정제해야 합니다.")\r
\r
        return control, treatment\r
\r
\r
    try:\r
        validateAbSamples([50.0], [52.0, 53.0])\r
    except ValueError as exc:\r
        print("의도한 오류 확인:", exc)\r
    else:\r
        raise AssertionError("관측값이 부족한 테스트를 통과시키면 안 됩니다.")\r
  exercise:\r
    prompt: 실무 A/B 테스트 의사결정 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def validateAbSamples(control, treatment):\r
          control = np.asarray(control, dtype=float)\r
          treatment = np.asarray(treatment, dtype=float)\r
\r
          if len(control) < 2 or len(treatment) < 2:\r
              raise ValueError("각 그룹에는 최소 2개 이상의 관측값이 필요합니다.")\r
          if np.isnan(control).any() or np.isnan(treatment).any():\r
              raise ValueError("A/B 테스트 표본에 결측값이 있으면 먼저 정제해야 합니다.")\r
\r
          return control, treatment\r
\r
\r
      try:\r
          validateAbSamples([50.0], [52.0, 53.0])\r
      except ValueError as exc:\r
          print("의도한 오류 확인:", exc)\r
      else:\r
          raise AssertionError("관측값이 부족한 테스트를 통과시키면 안 됩니다.")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실무 A/B 테스트 의사결정 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실무 A/B 테스트 의사결정 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: A/B 테스트 분석 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 t-검정, 효과 크기, 신뢰구간 분석을 활용하여 다양한 A/B 테스트를 분석합니다. 미션1은 랜딩 페이지 전환율 비교로 비율 검정을 사용합니다. 미션2는 앱 사용시간 비교로 Welch's t-검정을 사용합니다. 각 미션은 데이터 생성, 통계 검정, 시각화, 해석을 포함합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import stats\r
    import pandas as pd\r
\r
    np.random.seed(789)\r
    pageA = np.random.binomial(1, 0.12, 5000)\r
    pageB = np.random.binomial(1, 0.14, 5000)\r
\r
    convA = pageA.mean()\r
    convB = pageB.mean()\r
    convA, convB\r
  exercise:\r
    prompt: 실습 예제에서 \`pageA\`, \`pageB\`, \`convA\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from scipy import stats\r
      import pandas as pd\r
\r
      np.random.seed(789)\r
      pageA = np.random.binomial(1, 0.12, 5000)\r
      pageB = np.random.binomial(1, 0.14, 5000)\r
\r
      convA = pageA.mean()\r
      convB = pageB.mean()\r
      convA, convB\r
    hints:\r
    - 바꿀 지점은 \`pageA = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pageA\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`pageA\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
`;export{e as default};