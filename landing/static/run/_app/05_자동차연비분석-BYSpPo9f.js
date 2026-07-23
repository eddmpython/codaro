var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_05\r
  title: 자동차연비분석\r
  order: 5\r
  category: pandas\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 기초\r
  dataSource: codaro-local:mpg\r
  tags:\r
  - mpg\r
  - sort\r
  - pivot_table\r
  - nlargest\r
  - 검증\r
  - 피벗분석\r
  seo:\r
    title: pandas 정렬과 피벗테이블 - 자동차 연비 TOP 10 분석\r
    description: 자동차 연비 데이터로 정렬(sort_values), TOP N(nlargest), 피벗테이블(pivot_table)을 배웁니다. 연도별 연비 추이 분석.\r
    keywords:\r
    - pandas sort_values\r
    - nlargest\r
    - pivot_table\r
    - 피벗테이블\r
    - mpg 데이터\r
intro:\r
  emoji: 🚗\r
  goal: 자동차 연비 데이터에서 "연비 TOP 10"과 "연도별 연비 추이"를 분석합니다.\r
  description: 기초 과정 마무리! 정렬과 피벗테이블을 배웁니다. TOP N을 뽑거나, 행과 열을 기준으로 요약합니다.\r
  direction: 자동차연비분석에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.\r
  benefits:\r
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.\r
  - 자동차연비분석 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 미리보기 처리 실행\r
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 제조국별 개수 결과 검증\r
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.\r
    - label: 자동차연비분석 재사용\r
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 자동차연비분석 실행\r
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.\r
    - label: 자동차연비분석 완료\r
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 자동차 연비 데이터\r
  goal: 1단계. 데이터 불러오기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 자동차 연비 데이터셋은 1970년대~1980년대 미국, 일본, 유럽에서 생산된 자동차 144대의 로컬 샘플 연비와 성능 정보를 담고 있습니다. mpg(miles per\r
    gallon, 갤런당 마일)는 연비를 나타내며, 숫자가 클수록 연비가 좋습니다. cylinders(실린더 수), displacement(배기량), horsepower(마력),\r
    weight(무게), acceleration(가속력), model_year(연식), origin(제조국) 등 9개의 컬럼이 있습니다. 이 데이터로 정렬(sort), TOP N\r
    추출(nlargest), 피벗테이블(pivot_table) 등 pandas의 핵심 분석 기법을 배웁니다. 로컬 실행에서는 같은 분석 질문을 계속 풀 수 있도록 작은 자동차 샘플을\r
    함께 둡니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    mpg = loadLocalDataset("mpg")\r
    mpg.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      mpg = loadLocalDataset("mpg")\r
      mpg.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 데이터 구조 파악\r
  goal: 2단계. 미리보기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: head()로 데이터의 구조를 파악합니다. 각 행은 하나의 자동차 모델을 나타내며, name 컬럼에는 제조사와 모델명이 포함되어 있습니다. cylinders는\r
    엔진의 실린더 개수(4, 6, 8기통 등)로, 일반적으로 숫자가 클수록 출력은 높지만 연비는 낮습니다. horsepower는 엔진 출력을 나타내고, weight는 차량 무게로\r
    연비에 큰 영향을 미칩니다. model_year는 70~82로 표시되며 1970~1982년을 의미합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: mpg.head()\r
  exercise:\r
    prompt: 2단계. 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: mpg.head()\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_value_counts\r
  title: 3단계. 제조국별 개수\r
  structuredPrimary: true\r
  subtitle: value_counts로 확인\r
  goal: 3단계. 제조국별 개수에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: usa, japan, europe 3개 제조국이 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: mpg['origin'].value_counts()\r
  exercise:\r
    prompt: 3단계. 제조국별 개수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg['origin'].value_counts()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 제조국별 개수의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 3단계. 제조국별 개수 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step4_sort_asc\r
  title: 4단계. 오름차순 정렬\r
  structuredPrimary: true\r
  subtitle: sort_values()\r
  goal: 4단계. 오름차순 정렬에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    sort_values() 메서드는 DataFrame을 특정 컬럼 기준으로 정렬합니다. 기본값은 오름차순(ascending order)으로, 작은 값부터 큰 값 순서로 정렬됩니다. 데이터의 순서를 바꾸면 최소값, 최대값, 상위/하위 데이터를 쉽게 찾을 수 있습니다. 정렬은 데이터 분석에서 매우 자주 사용되는 기본 기능입니다.\r
\r
    sort_values()는 원본을 변경하지 않고 정렬된 새 DataFrame을 반환합니다. 원본을 직접 변경하려면 inplace=True 파라미터를 추가하면 되지만, Codaro 환경에서는 변수 재할당 문제가 발생할 수 있으므로 권장하지 않습니다.\r
  tips:\r
  - sort_values()는 원본을 변경하지 않고 정렬된 새 DataFrame을 반환합니다. 원본을 직접 변경하려면 inplace=True 파라미터를 추가하면 되지만, Codaro\r
    환경에서는 변수 재할당 문제가 발생할 수 있으므로 권장하지 않습니다.\r
  snippet: mpg.sort_values('mpg').head()\r
  exercise:\r
    prompt: 4단계. 오름차순 정렬 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: mpg.sort_values('mpg').head()\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 오름차순 정렬의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 오름차순 정렬의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_sort_desc\r
  title: 5단계. 내림차순 정렬\r
  structuredPrimary: true\r
  subtitle: ascending=False\r
  goal: 5단계. 내림차순 정렬에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: ascending=False를 추가하면 내림차순(큰 값부터)입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: mpg.sort_values('mpg', ascending=False).head()\r
  exercise:\r
    prompt: 5단계. 내림차순 정렬 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: mpg.sort_values('mpg', ascending=False).head()\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 내림차순 정렬의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. 내림차순 정렬의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step6_nlargest\r
  title: 6단계. TOP N 뽑기\r
  structuredPrimary: true\r
  subtitle: nlargest()\r
  goal: 6단계. TOP N 뽑기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    nlargest(N, '컬럼') 메서드는 지정한 컬럼 기준으로 가장 큰 값 N개를 바로 뽑아줍니다. sort_values(..., ascending=False).head(N)과 같은 결과지만 훨씬 간결하고 의미가 명확합니다. TOP 10, TOP 100 같은 순위 분석에 매우 유용합니다.\r
\r
    nlargest()와 반대로 nsmallest()는 가장 작은 값 N개를 뽑습니다. 예를 들어 mpg.nsmallest(10, 'mpg')는 연비가 가장 낮은 10대를 보여줍니다.\r
  snippet: mpg.nlargest(10, 'mpg')[['name', 'mpg', 'origin', 'model_year']]\r
  exercise:\r
    prompt: 6단계. TOP N 뽑기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg.nlargest(10, 'mpg')[['name', 'mpg', 'origin', 'model_year']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. TOP N 뽑기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 6단계. TOP N 뽑기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step7_nsmallest\r
  title: 7단계. 하위 N개\r
  structuredPrimary: true\r
  subtitle: nsmallest()\r
  goal: 7단계. 하위 N개에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: nsmallest()는 하위 N개를 뽑습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: mpg.nsmallest(5, 'weight')[['name', 'weight', 'mpg']]\r
  exercise:\r
    prompt: 7단계. 하위 N개 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg.nsmallest(5, 'weight')[['name', 'weight', 'mpg']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 하위 N개의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 하위 N개 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step7_5_assign_grade\r
  title: 7.5단계. 연비 등급 추가\r
  structuredPrimary: true\r
  subtitle: assign + apply 복습\r
  goal: 7.5단계. 연비 등급 추가에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    이전에 배운 assign()과 apply()를 복습합니다. 연비(mpg)를 기준으로 A(30 이상), B(20~30), C(20 미만) 등급을 분류하는 새로운 컬럼을 추가합니다. assign()으로 새 컬럼을 만들고, apply()로 각 값에 함수를 적용합니다. 이렇게 파생 변수를 만들면 데이터를 더 쉽게 분석할 수 있습니다.\r
\r
    assign()은 새 컬럼을 추가하고, apply()는 각 값에 함수를 적용합니다. lambda x: 조건문은 if-else를 한 줄로 작성하는 방법입니다. 이전 프로젝트(04번)에서 배운 개념을 여기서 다시 활용하고 있습니다.\r
  tips:\r
  - 'assign()은 새 컬럼을 추가하고, apply()는 각 값에 함수를 적용합니다. lambda x: 조건문은 if-else를 한 줄로 작성하는 방법입니다. 이전 프로젝트(04번)에서\r
    배운 개념을 여기서 다시 활용하고 있습니다.'\r
  snippet: |-\r
    graded = mpg.assign(\r
        efficiencyGrade=mpg['mpg'].apply(\r
            lambda x: 'A' if x >= 30 else ('B' if x >= 20 else 'C')\r
        )\r
    )\r
    graded[['name', 'mpg', 'efficiencyGrade']].head(10)\r
  exercise:\r
    prompt: 7.5단계. 연비 등급 추가 예제에서 조건값을 바꾸고 선택되는 분기와 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      graded = mpg.assign(\r
          efficiencyGrade=mpg['mpg'].apply(\r
              lambda x: 'A' if x >= 30 else ('B' if x >= 20 else 'C')\r
          )\r
      )\r
      graded[['name', 'mpg', 'efficiencyGrade']].head(10)\r
    hints:\r
    - 바꿀 지점은 if 조건식에 들어가는 비교값이나 boolean 값에서 찾으세요.\r
    - 실행 뒤 true/false 분기 중 어떤 코드가 평가됐는지 출력이나 변수값으로 확인하세요.\r
  check:\r
    type: noError\r
    noError: 7.5단계. 연비 등급 추가의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 7.5단계. 연비 등급 추가 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: step8_groupby_year\r
  title: 8단계. 연도별 평균 연비\r
  structuredPrimary: true\r
  subtitle: 시간에 따른 변화\r
  goal: 8단계. 연도별 평균 연비에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 연도(model_year)별로 그룹핑하면 시간에 따른 변화를 볼 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: mpg.groupby('model_year')['mpg'].mean()\r
  exercise:\r
    prompt: 8단계. 연도별 평균 연비 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg.groupby('model_year')['mpg'].mean()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 연도별 평균 연비의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. 연도별 평균 연비 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_groupby_origin\r
  title: 9단계. 제조국별 평균 연비\r
  structuredPrimary: true\r
  subtitle: 국가 비교\r
  goal: 9단계. 제조국별 평균 연비에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 일본차가 평균 30 mpg로 가장 높고, 미국차가 20 mpg로 가장 낮습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: mpg.groupby('origin')['mpg'].mean()\r
  exercise:\r
    prompt: 9단계. 제조국별 평균 연비 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg.groupby('origin')['mpg'].mean()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 제조국별 평균 연비의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 9단계. 제조국별 평균 연비 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step10_pivot\r
  title: 10단계. 피벗테이블 기본\r
  structuredPrimary: true\r
  subtitle: 행과 열로 요약\r
  goal: 10단계. 피벗테이블 기본에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    pivot_table은 엑셀의 피벗테이블과 동일한 기능으로, pandas에서 가장 강력한 데이터 요약 도구 중 하나입니다. groupby가 1차원 그룹핑이라면, pivot_table은 2차원 교차 분석표를 만듭니다. index는 행 기준, columns는 열 기준, values는 계산할 값, aggfunc는 집계 함수를 지정합니다. 예를 들어 "제조국별로(행) 실린더별로(열) 평균 연비를 보고 싶다"는 요구사항을 한 줄로 해결할 수 있습니다. 결과는 제조국 3개 × 실린더 종류 수만큼의 2차원 표가 됩니다. 복잡한 다차원 데이터를 직관적인 크로스탭으로 변환할 때 필수적입니다.\r
\r
    pivot_table의 4가지 핵심 파라미터: values(계산할 컬럼), index(행 기준), columns(열 기준), aggfunc(집계 함수). index와 columns는 리스트로 여러 개 지정 가능하며, 결과에서 NaN은 해당 조합이 없음을 의미합니다.\r
  tips:\r
  - 'pivot_table의 4가지 핵심 파라미터: values(계산할 컬럼), index(행 기준), columns(열 기준), aggfunc(집계 함수). index와 columns는\r
    리스트로 여러 개 지정 가능하며, 결과에서 NaN은 해당 조합이 없음을 의미합니다.'\r
  snippet: mpg.pivot_table(values='mpg', index='origin', columns='cylinders', aggfunc='mean')\r
  exercise:\r
    prompt: 10단계. 피벗테이블 기본 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: mpg.pivot_table(values='mpg', index='origin', columns='cylinders', aggfunc='mean')\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 피벗테이블 기본의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 피벗테이블 기본의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_pivot_year\r
  title: 11단계. 연도 × 제조국\r
  structuredPrimary: true\r
  subtitle: 시간 + 국가 비교\r
  goal: 11단계. 연도 × 제조국에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    pivot_table의 행과 열을 바꾸면 다른 관점의 분석이 가능합니다. 이번에는 연도를 행으로, 제조국을 열로 설정해서 시간의 흐름에 따른 국가별 연비 변화를 추적합니다. 1970년대 오일쇼크 이후 연비 향상 노력이 실제로 데이터에 반영되어 있는지 확인할 수 있습니다. 각 셀의 값은 해당 연도, 해당 국가에서 생산된 차량들의 평균 연비입니다. 이처럼 pivot_table은 시계열 비교에도 매우 유용합니다.\r
\r
    pivot_table 결과의 NaN 처리: fill_value=0 파라미터를 추가하면 NaN을 0으로 채울 수 있습니다. margins=True를 추가하면 행과 열의 합계(All)가 자동으로 계산됩니다.\r
  tips:\r
  - 'pivot_table 결과의 NaN 처리: fill_value=0 파라미터를 추가하면 NaN을 0으로 채울 수 있습니다. margins=True를 추가하면 행과 열의 합계(All)가\r
    자동으로 계산됩니다.'\r
  snippet: mpg.pivot_table(values='mpg', index='model_year', columns='origin', aggfunc='mean')\r
  exercise:\r
    prompt: 11단계. 연도 × 제조국 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: mpg.pivot_table(values='mpg', index='model_year', columns='origin', aggfunc='mean')\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 연도 × 제조국의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 연도 × 제조국의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_filter_groupby\r
  title: 12단계. 80년대 제조국별 연비\r
  structuredPrimary: true\r
  subtitle: 필터링 + 그룹핑\r
  goal: 12단계. 80년대 제조국별 연비에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    필터링과 그룹핑을 조합하면 특정 조건의 데이터만 선택해서 그룹별 통계를 구할 수 있습니다. 80년대(model_year >= 80) 차량만 필터링한 후, 제조국별로 평균 연비를 계산합니다. 이렇게 시대별, 세그먼트별 비교가 가능합니다. 80년대에는 일본차의 연비 우위가 더욱 두드러졌는지, 미국과 유럽은 어떻게 변했는지 확인할 수 있습니다. 메서드 체이닝을 통해 여러 분석 단계를 자연스럽게 연결할 수 있습니다.\r
\r
    메서드 체이닝 순서 주의: 필터링 → groupby → 집계 순서를 지켜야 합니다. 순서를 바꾸면 에러가 발생하거나 의도한 결과를 얻을 수 없습니다. query()를 사용하면 더 깔끔합니다: mpg.query('model_year >= 80').groupby('origin')['mpg'].mean()\r
  tips:\r
  - '메서드 체이닝 순서 주의: 필터링 → groupby → 집계 순서를 지켜야 합니다. 순서를 바꾸면 에러가 발생하거나 의도한 결과를 얻을 수 없습니다. query()를 사용하면\r
    더 깔끔합니다: mpg.query(''model_year >= 80'').groupby(''origin'')[''mpg''].mean()'\r
  snippet: mpg[mpg['model_year'] >= 80].groupby('origin')['mpg'].mean()\r
  exercise:\r
    prompt: 12단계. 80년대 제조국별 연비 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg[mpg['model_year'] >= 80].groupby('origin')['mpg'].mean()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 80년대 제조국별 연비의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 12단계. 80년대 제조국별 연비 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step13_complex\r
  title: 13단계. 6기통 이상 연비 TOP 5\r
  structuredPrimary: true\r
  subtitle: 필터링 + 정렬\r
  goal: 13단계. 6기통 이상 연비 TOP 5에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    복잡한 분석 요구사항을 여러 메서드를 조합해서 해결하는 실전 예제입니다. "6기통 이상의 큰 엔진을 가진 차량 중에서도 연비가 좋은 차는 무엇인가?"라는 질문에 답합니다. 먼저 cylinders >= 6으로 필터링해서 6기통, 8기통 차량만 선택하고, nlargest(5, 'mpg')로 그 중 연비 상위 5대를 뽑습니다. 마지막으로 [['name', 'mpg', 'cylinders']]로 필요한 컬럼만 선택합니다. 이처럼 pandas의 여러 기능을 체인으로 연결하면 복잡한 조건도 한 줄로 처리할 수 있습니다.\r
\r
    복잡한 체이닝은 가독성을 위해 줄바꿈할 수 있습니다. mpg[mpg['cylinders'] >= 6] .nlargest(5, 'mpg') .[ ['name', 'mpg']]처럼 작성하면 각 단계가 명확해집니다. 또는 괄호로 감싸면 됩니다.\r
  tips:\r
  - 복잡한 체이닝은 가독성을 위해 줄바꿈할 수 있습니다. mpg[mpg['cylinders'] >= 6] .nlargest(5, 'mpg') .[ ['name', 'mpg']]처럼\r
    작성하면 각 단계가 명확해집니다. 또는 괄호로 감싸면 됩니다.\r
  snippet: mpg[mpg['cylinders'] >= 6].nlargest(5, 'mpg')[['name', 'mpg', 'cylinders']]\r
  exercise:\r
    prompt: 13단계. 6기통 이상 연비 TOP 5 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: mpg[mpg['cylinders'] >= 6].nlargest(5, 'mpg')[['name', 'mpg', 'cylinders']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 6기통 이상 연비 TOP 5의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 13단계. 6기통 이상 연비 TOP 5 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 연비 리포트와 피벗 점검'\r
  structuredPrimary: true\r
  subtitle: sort, nlargest, pivot_table, 실패 케이스\r
  goal: '현업 흐름 검증: 연비 리포트와 피벗 점검에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    자동차 연비 분석은 정렬 결과와 그룹 평균이 맞는지 같이 봐야 합니다. 상위 차량 목록과 제조국별 피벗이 같은 원본에서 나왔는지 검증하세요.\r
\r
    변주 실험\r
    제조국별 평균 대신 중앙값을 쓰면 순위가 달라지는지 pivot_table의 aggfunc만 바꿔 비교하세요.\r
  tips:\r
  - 변주 실험 제조국별 평균 대신 중앙값을 쓰면 순위가 달라지는지 pivot_table의 aggfunc만 바꿔 비교하세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    mpg = pd.DataFrame({\r
        "name": ["a", "b", "c", "d"],\r
        "mpg": [30, 22, 35, 18],\r
        "cylinders": [4, 6, 4, 8],\r
        "origin": ["japan", "usa", "japan", "usa"],\r
    })\r
\r
    top = mpg.nlargest(2, "mpg")\r
    pivot = mpg.pivot_table(index="origin", values="mpg", aggfunc="mean")\r
\r
    assert top["name"].tolist() == ["c", "a"]\r
    assert pivot.loc["japan", "mpg"] == 32.5\r
    assert pivot.loc["usa", "mpg"] == 20.0\r
  exercise:\r
    prompt: '현업 흐름 검증: 연비 리포트와 피벗 점검 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import pandas as pd\r
\r
      mpg = pd.DataFrame({\r
          "name": ["a", "b", "c", "d"],\r
          "mpg": [30, 22, 35, 18],\r
          "cylinders": [4, 6, 4, 8],\r
          "origin": ["japan", "usa", "japan", "usa"],\r
      })\r
\r
      top = mpg.nlargest(2, "mpg")\r
      pivot = mpg.pivot_table(index="origin", values="mpg", aggfunc="mean")\r
\r
      assert top["name"].tolist() == ["c", "a"]\r
      assert pivot.loc["japan", "mpg"] == 32.5\r
      assert pivot.loc["usa", "mpg"] == 20.0\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 연비 리포트와 피벗 점검의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.'\r
    resultCheck: '현업 흐름 검증: 연비 리포트와 피벗 점검의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 자동차 연비 분석 프로젝트\r
  goal: 실습에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    배운 모든 내용을 활용해서 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset("mpg")\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset("mpg")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 기초 과정 완료!\r
  blocks:\r
  - type: text\r
    content: pandas 기초 과정(01~05)을 모두 완료했습니다! 데이터 불러오기부터 필터링, 그룹핑, 결측치 처리, 정렬, 피벗테이블까지 실무에서 가장 많이 사용하는\r
      핵심 기능들을 익혔습니다. 이제 여러분은 실제 데이터를 pandas로 분석할 수 있는 기본기를 갖추었습니다.\r
  - type: list\r
    items:\r
    - df.sort_values('컬럼', ascending=False) - 정렬 (오름차순/내림차순)\r
    - df.nlargest(N, '컬럼') - 상위 N개 (TOP N)\r
    - df.nsmallest(N, '컬럼') - 하위 N개 (BOTTOM N)\r
    - df.pivot_table(values, index, columns, aggfunc) - 피벗테이블 (2차원 교차 분석)\r
    - df.groupby('컬럼').mean() - 그룹별 집계 (1차원 그룹핑)\r
    - 메서드 체이닝 - 필터링.그룹핑.집계를 한 줄로\r
  - type: text\r
    content: 다음 시간부터는 중급 과정입니다. 시계열 분석, 문자열 처리, 데이터 병합 등 더 고급 기술을 배웁니다.\r
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
`;export{e as default};