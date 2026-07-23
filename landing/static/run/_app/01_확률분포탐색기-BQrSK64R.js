var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_01\r
  title: 확률분포탐색기\r
  order: 1\r
  category: scipy\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - scipy.stats\r
  - 정규분포\r
  - 균등분포\r
  - 확률밀도함수\r
  - 누적분포함수\r
  seo:\r
    title: scipy.stats 확률분포 - 정규분포와 균등분포 시각화\r
    description: scipy.stats로 정규분포, 균등분포를 시각화하고 확률을 계산합니다. PDF, CDF, PPF 함수를 배웁니다.\r
    keywords:\r
    - scipy\r
    - stats\r
    - 정규분포\r
    - 확률분포\r
    - PDF\r
    - CDF\r
intro:\r
  emoji: 🎲\r
  goal: 시험 점수 분포를 분석하여 합격률과 상위권 기준을 계산합니다.\r
  description: 학교에서 시험을 치르면 점수 분포가 어떻게 되는지 궁금할 때가 있습니다. 평균 70점, 표준편차 15점인 시험에서 60점 이상 합격률은 몇 %일까요? 상위\r
    10%에 들려면 몇 점이 필요할까요? scipy.stats의 정규분포 함수로 이런 실제 문제를 해결합니다. 확률밀도함수(PDF), 누적분포함수(CDF), 분위수함수(PPF)의\r
    개념과 사용법을 익히고, 시각화까지 완성합니다.\r
  direction: 확률분포탐색기에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 확률분포탐색기 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 정규분포 생성 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 확률밀도함수 탐색 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 확률분포탐색기 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 확률분포탐색기 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 확률분포탐색기 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: scipy.stats\r
  goal: 라이브러리 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    scipy는 과학 계산을 위한 Python 라이브러리입니다. scipy.stats 모듈에는 80개 이상의 확률분포와 다양한 통계 함수가 포함되어 있습니다. 정규분포, 균등분포, 지수분포, 이항분포 등 통계학에서 사용하는 거의 모든 분포를 지원합니다. 이 프로젝트에서는 가장 기본적인 정규분포를 다루며, 실제 시험 점수 분석에 적용합니다.\r
\r
    scipy는 라이브러리 패널이 meta.packages 기준으로 준비합니다. 준비가 끝난 뒤에는 세션 동안 유지되며, scipy.stats는 from scipy import stats로 불러오는 것이 일반적입니다.\r
  tips:\r
  - scipy는 라이브러리 패널에서 준비한 뒤 import로 확인합니다. scipy.stats는 from scipy import stats로 불러오는 것이 일반적입니다.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import stats\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import stats\r
      import matplotlib.pyplot as plt\r
    hints:\r
    - 바꿀 지점은 수치 입력을 만드는 첫 줄과 최적화/적분/신호 처리 줄에서 찾으세요.\r
    - 실행 뒤 오차와 결과 범위 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 오차와 결과 범위 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: create_dist\r
  title: 정규분포 생성\r
  structuredPrimary: true\r
  subtitle: stats.norm\r
  goal: 정규분포 생성에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    정규분포(Normal Distribution)는 통계학에서 가장 중요한 분포입니다. 종 모양 곡선으로 유명하며, 자연현상의 많은 데이터가 이 분포를 따릅니다. 키, 몸무게, IQ, 시험 점수 등이 대표적입니다. scipy.stats.norm()으로 정규분포 객체를 생성하며, loc은 평균(중심 위치), scale은 표준편차(퍼짐 정도)를 의미합니다. 평균 70점, 표준편차 15점인 시험 점수 분포를 만들어봅니다.\r
\r
    loc=0, scale=1인 정규분포를 표준정규분포라고 합니다. 모든 정규분포는 표준화를 통해 표준정규분포로 변환할 수 있습니다. Z = (X - μ) / σ 공식을 사용합니다.\r
  snippet: |-\r
    scoreDist = stats.norm(loc=70, scale=15)\r
    scoreDist\r
  exercise:\r
    prompt: 정규분포 생성 예제에서 \`scoreDist\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      scoreDist = stats.norm(loc=70, scale=15)\r
      scoreDist\r
    hints:\r
    - 바꿀 지점은 \`scoreDist = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`scoreDist\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 정규분포 생성에서 \`scoreDist\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 정규분포 생성 실행 뒤 \`scoreDist\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: pdf_explore\r
  title: 확률밀도함수 탐색\r
  structuredPrimary: true\r
  subtitle: PDF\r
  goal: 확률밀도함수 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    확률밀도함수(Probability Density Function, PDF)는 각 값의 상대적 가능성을 나타냅니다. 주의할 점은 PDF 값 자체는 확률이 아닙니다. 연속분포에서 특정 점의 확률은 0입니다. PDF는 상대적 가능성을 보여주며, 구간의 면적이 실제 확률입니다. 정규분포에서는 평균 근처 값이 가장 높고, 평균에서 멀어질수록 PDF 값이 낮아집니다.\r
\r
    PDF 곡선 아래 전체 면적은 항상 1입니다. 이것이 확률의 기본 성질입니다. 특정 구간의 면적이 해당 구간에 값이 있을 확률입니다.\r
  snippet: |-\r
    pdfAt70 = scoreDist.pdf(70)\r
    pdfAt85 = scoreDist.pdf(85)\r
    pdfAt70, pdfAt85\r
  exercise:\r
    prompt: 확률밀도함수 탐색 예제에서 \`pdfAt70\`, \`pdfAt85\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      pdfAt70 = scoreDist.pdf(70)\r
      pdfAt85 = scoreDist.pdf(85)\r
      pdfAt70, pdfAt85\r
    hints:\r
    - 바꿀 지점은 \`pdfAt70 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pdfAt70\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 확률밀도함수 탐색에서 \`pdfAt70\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 확률밀도함수 탐색 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: cdf_explore\r
  title: 누적분포함수 탐색\r
  structuredPrimary: true\r
  subtitle: CDF\r
  goal: 누적분포함수 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    누적분포함수(Cumulative Distribution Function, CDF)는 특정 값 이하일 확률을 나타냅니다. CDF(60) = 0.25라면 60점 이하일 확률이 25%라는 뜻입니다. 합격 기준이 60점이라면, 합격률은 1 - CDF(60)으로 계산합니다. CDF는 항상 0에서 시작해서 1로 끝나며, 단조 증가합니다. S자 형태의 곡선으로 나타납니다.\r
\r
    구간 확률을 계산하려면 CDF를 뺍니다. P(60 < X < 80) = CDF(80) - CDF(60)입니다. 이 방법으로 특정 점수 구간에 속할 확률을 구할 수 있습니다.\r
  snippet: |-\r
    probFail = scoreDist.cdf(60)\r
    probPass = 1 - probFail\r
    probFail, probPass\r
  exercise:\r
    prompt: 누적분포함수 탐색 예제에서 \`probFail\`, \`probPass\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      probFail = scoreDist.cdf(60)\r
      probPass = 1 - probFail\r
      probFail, probPass\r
    hints:\r
    - 바꿀 지점은 \`probFail = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`probFail\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 누적분포함수 탐색에서 \`probFail\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 누적분포함수 탐색 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: ppf_explore\r
  title: 분위수함수 탐색\r
  structuredPrimary: true\r
  subtitle: PPF\r
  goal: 분위수함수 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    분위수함수(Percent Point Function, PPF)는 CDF의 역함수입니다. 확률을 입력하면 해당 분위수를 반환합니다. 상위 10%에 들려면 몇 점이 필요한지 알고 싶을 때 사용합니다. PPF(0.9)는 하위 90% 경계, 즉 상위 10% 경계를 의미합니다. 장학금 기준이나 등급 컷오프를 계산할 때 매우 유용합니다.\r
\r
    통계에서 자주 보는 ±1.96은 표준정규분포의 PPF(0.025)와 PPF(0.975) 값입니다. 95% 신뢰구간의 기준이 되는 숫자입니다.\r
  snippet: |-\r
    top10Cutoff = scoreDist.ppf(0.9)\r
    top5Cutoff = scoreDist.ppf(0.95)\r
    top1Cutoff = scoreDist.ppf(0.99)\r
    top10Cutoff, top5Cutoff, top1Cutoff\r
  exercise:\r
    prompt: 분위수함수 탐색 예제에서 \`top10Cutoff\`, \`top5Cutoff\`, \`top1Cutoff\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      top10Cutoff = scoreDist.ppf(0.9)\r
      top5Cutoff = scoreDist.ppf(0.95)\r
      top1Cutoff = scoreDist.ppf(0.99)\r
      top10Cutoff, top5Cutoff, top1Cutoff\r
    hints:\r
    - 바꿀 지점은 \`top10Cutoff = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`top10Cutoff\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 분위수함수 탐색에서 \`top10Cutoff\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 분위수함수 탐색 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: result\r
  title: 종합 분석 결과\r
  structuredPrimary: true\r
  subtitle: 시험 점수 리포트\r
  goal: 종합 분석 결과에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 지금까지 배운 PDF, CDF, PPF를 모두 활용하여 종합 분석 결과를 만듭니다. 실무에서는 이렇게 여러 통계량을 한 번에 계산하여 리포트를 작성합니다.\r
    분포의 특성을 파악하고, 의사결정에 필요한 정보를 추출하는 것이 통계 분석의 목적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    analysisResult = pd.DataFrame({\r
        'Metric': ['평균', '표준편차', '60점 이상 합격률', '상위 10% 컷오프', '상위 5% 컷오프', '상위 1% 컷오프'],\r
        'Value': ['70점', '15점', f'{probPass:.1%}', f'{top10Cutoff:.1f}점', f'{top5Cutoff:.1f}점', f'{top1Cutoff:.1f}점']\r
    })\r
    analysisResult\r
  exercise:\r
    prompt: 종합 분석 결과 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      analysisResult = pd.DataFrame({\r
          'Metric': ['평균', '표준편차', '60점 이상 합격률', '상위 10% 컷오프', '상위 5% 컷오프', '상위 1% 컷오프'],\r
          'Value': ['70점', '15점', f'{probPass:.1%}', f'{top10Cutoff:.1f}점', f'{top5Cutoff:.1f}점', f'{top1Cutoff:.1f}점']\r
      })\r
      analysisResult\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 종합 분석 결과의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 종합 분석 결과의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 실무 확률분포 리포트 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 확인 → 면적 검증 → 기준 실험\r
  goal: 실무 확률분포 리포트 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 분포 함수는 숫자가 나오기 때문에 맞아 보이기 쉽습니다. 하지만 표준편차가 0 이하이거나, 상위 비율을 0~1 범위 밖으로 넣으면 리포트 자체가 잘못됩니다.\r
    이번 단계에서는 합격률과 상위권 컷오프를 먼저 예상하고, 잘못된 입력을 일부러 실패시킨 뒤, PDF 면적과 CDF/PPF 결과를 검증합니다. 마지막에는 합격 기준과 상위권 기준을\r
    바꾸며 의사결정이 어떻게 달라지는지 실험합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def validateScoreModel(meanScore, stdScore, passScore, topRate):\r
        if stdScore <= 0:\r
            raise ValueError("표준편차는 0보다 커야 합니다.")\r
        if not 0 < topRate < 1:\r
            raise ValueError("상위 비율은 0과 1 사이여야 합니다.")\r
        if passScore < 0 or passScore > 100:\r
            raise ValueError("합격 기준은 0~100점 범위 안에 있어야 합니다.")\r
\r
        return stats.norm(loc=meanScore, scale=stdScore)\r
\r
\r
    try:\r
        validateScoreModel(meanScore=70, stdScore=0, passScore=60, topRate=0.1)\r
    except ValueError as exc:\r
        print("의도한 오류 확인:", exc)\r
    else:\r
        raise AssertionError("표준편차가 0인 분포는 통과시키면 안 됩니다.")\r
  exercise:\r
    prompt: 실무 확률분포 리포트 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def validateScoreModel(meanScore, stdScore, passScore, topRate):\r
          if stdScore <= 0:\r
              raise ValueError("표준편차는 0보다 커야 합니다.")\r
          if not 0 < topRate < 1:\r
              raise ValueError("상위 비율은 0과 1 사이여야 합니다.")\r
          if passScore < 0 or passScore > 100:\r
              raise ValueError("합격 기준은 0~100점 범위 안에 있어야 합니다.")\r
\r
          return stats.norm(loc=meanScore, scale=stdScore)\r
\r
\r
      try:\r
          validateScoreModel(meanScore=70, stdScore=0, passScore=60, topRate=0.1)\r
      except ValueError as exc:\r
          print("의도한 오류 확인:", exc)\r
      else:\r
          raise AssertionError("표준편차가 0인 분포는 통과시키면 안 됩니다.")\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실무 확률분포 리포트 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실무 확률분포 리포트 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 확률분포 활용 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 정규분포의 PDF, CDF, PPF를 활용하여 실제 문제를 해결합니다. 미션1은 고객 서비스 대기시간 분석으로 지수분포를 사용합니다. 미션2는 제품 품질 관리로 정규분포를 사용합니다. 두 미션 모두 분포 생성, 확률 계산, 시각화를 포함합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import stats\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    waitDist = stats.expon(scale=5)\r
    xWait = np.linspace(0, 30, 200)\r
  exercise:\r
    prompt: 실습 예제에서 \`waitDist\`, \`xWait\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from scipy import stats\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      waitDist = stats.expon(scale=5)\r
      xWait = np.linspace(0, 30, 200)\r
    hints:\r
    - 바꿀 지점은 \`waitDist = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`waitDist\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`waitDist\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
`;export{e as default};