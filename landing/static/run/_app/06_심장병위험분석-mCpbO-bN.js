var e=`meta:
  packages:
  - numpy
  - pandas
  id: numpy_06
  title: 심장병위험분석
  order: 6
  category: numpy
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - numpy
  - concatenate
  - vstack
  - any
  - all
  - sort
  - argsort
  - cumsum
  - 검증
  - 위험점수
  seo:
    title: NumPy 배열 결합과 정렬 - 심장병 위험 분석
    description: NumPy의 배열 결합과 정렬을 배우며 심장병 위험 요인 데이터를 분석합니다.
    keywords:
    - numpy
    - concatenate
    - sort
    - argsort
    - cumsum
    - 심장병
intro:
  emoji: ❤️
  goal: 심장병 환자 데이터로 배열 결합과 정렬을 익힙니다.
  description: 303명의 심장병 환자 데이터를 분석합니다. 배열 결합(concatenate)으로 데이터를 병합하고, 정렬과 누적합으로 위험 요인을 분석합니다.
  direction: 심장병위험분석에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.
  benefits:
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.
  - 심장병위험분석 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 로드 처리 실행
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 컬럼 확인 결과 검증
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.
    - label: 심장병위험분석 재사용
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.
    runtime:
    - label: 배열 계산 환경
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 심장병위험분석 실행
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.
    - label: 심장병위험분석 완료
      detail: 검증된 코드를 계산 파이프라인로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: NumPy와 pandas를 불러옵니다. pandas는 CSV 로딩용으로만 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import numpy as np
    import pandas as pd
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import numpy as np
      import pandas as pd
    hints:
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_data
  title: 2단계. 데이터 로드
  structuredPrimary: true
  subtitle: 심장병 데이터셋
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: UCI(캘리포니아 대학교)에서 제공하는 유명한 심장병 데이터셋입니다. 303명의 환자 데이터가 있으며, 콜레스테롤(chol, 혈중 지방 수치), 안정 시 혈압(trestbps),
    최대 심박수(thalach) 등 건강 지표와 함께 심장병 유무(target, 1이면 심장병 있음)가 기록되어 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from codaro.curriculum.localData import loadLocalDataset

    df = loadLocalDataset("heart")
    df.head()
  exercise:
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from codaro.curriculum.localData import loadLocalDataset

      df = loadLocalDataset("heart")
      df.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_columns
  title: 3단계. 컬럼 확인
  structuredPrimary: true
  subtitle: 데이터 구조
  goal: 3단계. 컬럼 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.
  explanation: 데이터의 컬럼을 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: df.columns.tolist()
  exercise:
    prompt: 3단계. 컬럼 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: df.columns.tolist()
    hints:
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 컬럼 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 3단계. 컬럼 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step4_extract
  title: 4단계. 배열 추출
  structuredPrimary: true
  subtitle: 주요 변수
  goal: 4단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 주요 수치형 변수들을 NumPy 배열로 추출합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    age = df['age'].values
    chol = df['chol'].values
    bp = df['trestbps'].values
    hr = df['thalach'].values
    target = df['target'].values
    age.shape
  exercise:
    prompt: 4단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      age = df['age'].values
      chol = df['chol'].values
      bp = df['trestbps'].values
      hr = df['thalach'].values
      target = df['target'].values
      age.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 4단계. 배열 추출에서 \`age\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step5_concat_1d
  title: 5단계. 1차원 배열 결합
  structuredPrimary: true
  subtitle: np.concatenate()
  goal: 5단계. 1차원 배열 결합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    concatenate(연결하다)는 여러 배열을 하나로 이어붙이는 함수입니다. 기차 객차를 연결하듯이 배열들을 순서대로 붙입니다. 예를 들어 [1,2,3]과 [4,5]를 concatenate하면 [1,2,3,4,5]가 됩니다. 여러 소스의 데이터를 하나로 합칠 때 유용합니다.

    np.concatenate([arr1, arr2])는 배열들을 순서대로 이어붙입니다. 기본적으로 axis=0(첫 번째 축)을 따라 결합합니다.
  snippet: |-
    concat = np.concatenate([age, chol])
    concat.shape
  exercise:
    prompt: 5단계. 1차원 배열 결합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      concat = np.concatenate([age, chol])
      concat.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 1차원 배열 결합에서 \`concat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 5단계. 1차원 배열 결합 실행 뒤 \`concat\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step6_concat_2d
  title: 6단계. 2차원 열 결합
  structuredPrimary: true
  subtitle: axis=1
  goal: 6단계. 2차원 열 결합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    여러 변수를 열로 나란히 붙여 2차원 테이블을 만듭니다. 각 1차원 배열을 reshape(-1, 1)로 열 벡터로 바꾼 뒤, axis=1(열 방향)로 결합합니다. -1은 '나머지 크기는 자동 계산해줘'라는 의미입니다. 결과적으로 303명 × 3개 변수의 테이블이 만들어집니다.

    axis=1로 지정하면 열 방향으로 결합합니다. reshape(-1, 1)은 1D 배열을 열 벡터로 변환합니다. -1은 자동 계산을 의미합니다.
  snippet: |-
    c1 = age.reshape(-1, 1)
    c2 = chol.reshape(-1, 1)
    c3 = bp.reshape(-1, 1)
    features = np.concatenate([c1, c2, c3], axis=1)
    features.shape
  exercise:
    prompt: 6단계. 2차원 열 결합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      c1 = age.reshape(-1, 1)
      c2 = chol.reshape(-1, 1)
      c3 = bp.reshape(-1, 1)
      features = np.concatenate([c1, c2, c3], axis=1)
      features.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 2차원 열 결합에서 \`c1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 2차원 열 결합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step7_vstack_hstack
  title: 7단계. vstack과 column_stack
  structuredPrimary: true
  subtitle: 편리한 결합
  goal: 7단계. vstack과 columnstack에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    vstack, hstack, column_stack은 concatenate보다 직관적인 결합 함수입니다. vstack은 vertical(수직) stack으로 배열들을 위아래로 쌓고, hstack은 horizontal(수평) stack으로 좌우로 붙입니다. column_stack은 1차원 배열들을 각각 하나의 열로 만들어 옆으로 붙여줍니다.

    np.vstack()은 수직(행)으로, np.hstack()은 수평(열)으로 쌓습니다. np.column_stack()은 1D 배열들을 열로 쌓아 2D 배열을 만듭니다.
  snippet: |-
    v = np.vstack([age, chol, bp])
    v.shape
  exercise:
    prompt: 7단계. vstack과 columnstack 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      v = np.vstack([age, chol, bp])
      v.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. vstack과 columnstack에서 \`v\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. vstack과 columnstack 실행 뒤 \`v\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step8_group_compare
  title: 8단계. 그룹별 비교
  structuredPrimary: true
  subtitle: 심장병 유무
  goal: 8단계. 그룹별 비교에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 심장병 유무(target)에 따른 평균 나이를 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    sick = target == 1
    well = target == 0
    f"심장병 있음: {np.mean(age[sick]):.1f}세, 없음: {np.mean(age[well]):.1f}세"
  exercise:
    prompt: 8단계. 그룹별 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      sick = target == 1
      well = target == 0
      f"심장병 있음: {np.mean(age[sick]):.1f}세, 없음: {np.mean(age[well]):.1f}세"
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 그룹별 비교에서 \`sick\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 그룹별 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_any_all
  title: 9단계. any와 all
  structuredPrimary: true
  subtitle: 조건 검사
  goal: 9단계. any와 all에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    any()는 '하나라도 있으면 True', all()은 '전부 다 그래야 True'입니다. 예를 들어 np.any(chol > 240)은 콜레스테롤 240 초과인 환자가 한 명이라도 있는지 확인합니다. np.all(bp < 180)은 모든 환자의 혈압이 180 미만인지 검사합니다. 데이터 전체에 대한 조건 검증에 유용합니다.

    np.any()는 하나라도 True면 True, np.all()은 모두 True여야 True를 반환합니다. 데이터 검증에 유용합니다.
  snippet: |-
    hi1 = chol > 240
    hi2 = bp > 140
    any1 = np.any(hi1)
    all1 = np.all(bp < 180)
    f"고콜레스테롤 환자 존재: {any1}, 모든 환자 정상 혈압(<180): {all1}"
  exercise:
    prompt: 9단계. any와 all 예제에서 \`hi1\`, \`hi2\`, \`any1\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      hi1 = chol > 240
      hi2 = bp > 140
      any1 = np.any(hi1)
      all1 = np.all(bp < 180)
      f"고콜레스테롤 환자 존재: {any1}, 모든 환자 정상 혈압(<180): {all1}"
    hints:
    - 바꿀 지점은 \`hi1 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`hi1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. any와 all에서 \`hi1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 9단계. any와 all 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step10_any_axis
  title: 10단계. 행별 any/all
  structuredPrimary: true
  subtitle: axis=1
  goal: 10단계. 행별 any/all에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    각 환자별로 위험 요인이 있는지 확인합니다.

    axis=1로 지정하면 각 행(환자)별로 any/all을 계산합니다. axis=0은 각 열(위험요인)별로 계산합니다.
  snippet: |-
    risks = np.column_stack([hi1, hi2, age > 60])
    any2 = np.any(risks, axis=1)
    all2 = np.all(risks, axis=1)
    f"위험요인 1개 이상: {np.sum(any2)}명, 모든 위험요인: {np.sum(all2)}명"
  exercise:
    prompt: 10단계. 행별 any/all 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      risks = np.column_stack([hi1, hi2, age > 60])
      any2 = np.any(risks, axis=1)
      all2 = np.all(risks, axis=1)
      f"위험요인 1개 이상: {np.sum(any2)}명, 모든 위험요인: {np.sum(all2)}명"
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. 행별 any/all에서 \`risks\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 10단계. 행별 any/all 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step11_sort
  title: 11단계. 정렬
  structuredPrimary: true
  subtitle: np.sort()
  goal: 11단계. 정렬에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    나이순으로 데이터를 정렬합니다.

    np.sort()는 정렬된 새 배열을 반환합니다. 원본 배열은 변경되지 않습니다.
  snippet: |-
    sorted_ = np.sort(age)
    sorted_[:10]
  exercise:
    prompt: 11단계. 정렬 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      sorted_ = np.sort(age)
      sorted_[:10]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 11단계. 정렬에서 \`sorted_\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 11단계. 정렬 실행 뒤 \`sorted_\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step12_argsort
  title: 12단계. 정렬 인덱스
  structuredPrimary: true
  subtitle: np.argsort()
  goal: 12단계. 정렬 인덱스에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    argsort로 정렬 인덱스를 얻어 다른 배열도 같이 정렬합니다.

    np.argsort()는 정렬 후 인덱스를 반환합니다. 이 인덱스로 여러 배열을 동일한 순서로 정렬할 수 있습니다.
  snippet: |-
    order = np.argsort(age)
    arr1 = age[order]
    arr2 = chol[order]
    pd.DataFrame({'Age': arr1[:10], 'Cholesterol': arr2[:10]})
  exercise:
    prompt: 12단계. 정렬 인덱스 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      order = np.argsort(age)
      arr1 = age[order]
      arr2 = chol[order]
      pd.DataFrame({'Age': arr1[:10], 'Cholesterol': arr2[:10]})
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 정렬 인덱스의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 정렬 인덱스의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step13_top10
  title: 13단계. 상위 N개 추출
  structuredPrimary: true
  subtitle: 내림차순
  goal: 13단계. 상위 N개 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 콜레스테롤 기준 상위 10명을 찾습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    idx = np.argsort(chol)[::-1]
    top = idx[:10]
    pd.DataFrame({
        'Age': age[top],
        'Cholesterol': chol[top],
        'HeartDisease': target[top]
    })
  exercise:
    prompt: 13단계. 상위 N개 추출 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      idx = np.argsort(chol)[::-1]
      top = idx[:10]
      pd.DataFrame({
          'Age': age[top],
          'Cholesterol': chol[top],
          'HeartDisease': target[top]
      })
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 13단계. 상위 N개 추출의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 13단계. 상위 N개 추출의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step14_cumsum
  title: 14단계. 누적합
  structuredPrimary: true
  subtitle: np.cumsum()
  goal: 14단계. 누적합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    cumsum(cumulative sum, 누적합)은 배열의 값을 순서대로 더해가는 함수입니다. [1,2,3]의 cumsum은 [1, 1+2, 1+2+3] = [1, 3, 6]입니다. 나이순 정렬된 심장병 유무(1 또는 0) 데이터에 cumsum을 적용하면, 각 나이까지 심장병 환자가 몇 명인지 누적 수를 볼 수 있습니다.

    np.cumsum()은 누적합을 계산합니다. 시계열 분석이나 누적 분포를 볼 때 유용합니다.
  snippet: |-
    t = target[order]
    cumsum = np.cumsum(t)
    cumsum[:20]
  exercise:
    prompt: 14단계. 누적합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      t = target[order]
      cumsum = np.cumsum(t)
      cumsum[:20]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 14단계. 누적합에서 \`t\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 14단계. 누적합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step15_risk_score
  title: 15단계. 위험 점수 분석
  structuredPrimary: true
  subtitle: 종합 분석
  goal: 15단계. 위험 점수 분석에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 여러 위험 요인을 종합한 점수를 만들어 분석합니다. 불리언 배열에 .astype(int)를 적용하면 True는 1, False는 0으로 변환됩니다. 콜레스테롤
    > 200, 혈압 > 130, 나이 > 55 세 가지 조건을 더하면 0~3점의 위험 점수가 됩니다. 점수가 높을수록 심장병 발생률이 높아지는지 확인할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    score = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)
    levels, counts = np.unique(score, return_counts=True)
    rows = []
    for r in levels:
        mask = score == r
        rate = np.mean(target[mask])
        rows.append([r, np.sum(mask), round(rate * 100, 1)])
    pd.DataFrame(rows, columns=['RiskScore', 'Count', 'DiseaseRate(%)'])
  exercise:
    prompt: 15단계. 위험 점수 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      score = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)
      levels, counts = np.unique(score, return_counts=True)
      rows = []
      for r in levels:
          mask = score == r
          rate = np.mean(target[mask])
          rows.append([r, np.sum(mask), round(rate * 100, 1)])
      pd.DataFrame(rows, columns=['RiskScore', 'Count', 'DiseaseRate(%)'])
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 15단계. 위험 점수 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 15단계. 위험 점수 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 심장병 위험 점수 배치 계산'
  structuredPrimary: true
  subtitle: 조건 배열, 정렬, cumsum, 실패 케이스
  goal: '현업 흐름 검증: 심장병 위험 점수 배치 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    위험 점수는 조건을 많이 더하는 만큼 기준을 잘못 잡기 쉽습니다. 각 조건 배열을 분리해 예측하고, 정렬 후 누적 환자 수가 의도대로 계산되는지 검증하세요.

    변주 실험
    나이 기준을 55세에서 60세로 바꾸면 위험 점수 분포와 누적 환자 수 해석이 어떻게 달라지는지 비교하세요.
  tips:
  - 변주 실험 나이 기준을 55세에서 60세로 바꾸면 위험 점수 분포와 누적 환자 수 해석이 어떻게 달라지는지 비교하세요.
  snippet: |-
    import numpy as np

    age = np.array([45, 62, 58, 39])
    chol = np.array([180, 230, 205, 190])
    bp = np.array([120, 145, 135, 118])
    disease = np.array([0, 1, 1, 0])

    riskScore = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)
    order = np.argsort(age)
    cumulativeDisease = np.cumsum(disease[order])

    assert riskScore.tolist() == [0, 3, 3, 0]
    assert age[order].tolist() == [39, 45, 58, 62]
    assert cumulativeDisease.tolist() == [0, 0, 1, 2]
  exercise:
    prompt: '현업 흐름 검증: 심장병 위험 점수 배치 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import numpy as np

      age = np.array([45, 62, 58, 39])
      chol = np.array([180, 230, 205, 190])
      bp = np.array([120, 145, 135, 118])
      disease = np.array([0, 1, 1, 0])

      riskScore = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)
      order = np.argsort(age)
      cumulativeDisease = np.cumsum(disease[order])

      assert riskScore.tolist() == [0, 3, 3, 0]
      assert age[order].tolist() == [39, 45, 58, 62]
      assert cumulativeDisease.tolist() == [0, 0, 1, 2]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 심장병 위험 점수 배치 계산의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'
    resultCheck: '현업 흐름 검증: 심장병 위험 점수 배치 계산의 match/search/sub 결과가 바꾼 패턴이나 샘플 문자열 기준과 맞아야 합니다.'
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 심장병 위험 분석
  goal: 실습에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import numpy as np
    import pandas as pd

    heartIdx = np.arange(303)
    data = pd.DataFrame({
        'age': 35 + (heartIdx * 3) % 38,
        'trestbps': 112 + (heartIdx * 5) % 48,
        'chol': 165 + (heartIdx * 7) % 155,
        'thalach': 178 - (heartIdx * 4) % 58,
    })
    data['target'] = (
        (data['chol'] > 225).astype(int)
        + (data['trestbps'] > 135).astype(int)
        + (data['age'] > 56).astype(int)
        >= 2
    ).astype(int)
    age = data['age'].values
    hr = data['thalach'].values
    target = data['target'].values
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import numpy as np
      import pandas as pd

      heartIdx = np.arange(303)
      data = pd.DataFrame({
          'age': 35 + (heartIdx * 3) % 38,
          'trestbps': 112 + (heartIdx * 5) % 48,
          'chol': 165 + (heartIdx * 7) % 155,
          'thalach': 178 - (heartIdx * 4) % 58,
      })
      data['target'] = (
          (data['chol'] > 225).astype(int)
          + (data['trestbps'] > 135).astype(int)
          + (data['age'] > 56).astype(int)
          >= 2
      ).astype(int)
      age = data['age'].values
      hr = data['thalach'].values
      target = data['target'].values
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: numpy_06-heart-risk-points-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: 심장 위험 feature에 명시적 point rule 적용하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 연령·혈압·콜레스테롤·흡연 조건을 행별 point와 band로 변환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 각 feature가 몇 point를 더하는지 코드에서 읽을 수 있게 두세요.
    - 이 점수는 교육용 규칙이며 의료 진단으로 표현하지 마세요.
    exercise:
      prompt: score_heart_risk(rows)를 완성해 scores, bands, highRiskIndexes를 반환하세요.
      starterCode: |-
        def score_heart_risk(rows):
            raise NotImplementedError
      solution: |
        def score_heart_risk(rows):
            scores = []
            for row in rows:
                score = 0
                score += 1 if row["age"] >= 55 else 0
                score += 1 if row["systolic"] >= 140 else 0
                score += 1 if row["cholesterol"] >= 240 else 0
                score += 2 if row["smoker"] else 0
                scores.append(score)
            bands = ["low" if score <= 1 else "medium" if score <= 3 else "high" for score in scores]
            return {"scores": scores, "bands": bands, "highRiskIndexes": [index for index, band in enumerate(bands) if band == "high"]}
      hints: *id001
    check:
      id: python.numpy.numpy_06.heart-risk-points.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.numpy.numpy_06.heart-risk-points.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: score_heart_risk
        cases:
        - id: applies-transparent-point-rules
          arguments:
          - value:
            - age: 60
              systolic: 150
              cholesterol: 250
              smoker: true
            - age: 40
              systolic: 120
              cholesterol: 180
              smoker: false
            - age: 60
              systolic: 130
              cholesterol: 200
              smoker: true
          expectedReturn:
            scores:
            - 5
            - 0
            - 3
            bands:
            - high
            - low
            - medium
            highRiskIndexes:
            - 0
        - id: handles-empty-cohort
          arguments:
          - value: []
          expectedReturn:
            scores: []
            bands: []
            highRiskIndexes: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: numpy_06-binary-confusion-metrics-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - numpy_06-heart-risk-points-mastery
    title: 새 이진 예측 결과의 confusion matrix 계산하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: risk band를 실제 label·예측 label 비교와 precision·recall로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - precision 분모와 recall 분모를 구분하세요.
    - 분모가 0인 metric을 0으로 가장하지 말고 None으로 표시하세요.
    exercise:
      prompt: binary_metrics(actual, predicted)를 완성해 tp, tn, fp, fn, precision, recall을 반환하세요.
      starterCode: |-
        def binary_metrics(actual, predicted):
            raise NotImplementedError
      solution: |
        def binary_metrics(actual, predicted):
            if len(actual) != len(predicted) or any(value not in (0, 1) for value in actual + predicted):
                raise ValueError("aligned binary labels required")
            tp = sum(a == 1 and p == 1 for a, p in zip(actual, predicted))
            tn = sum(a == 0 and p == 0 for a, p in zip(actual, predicted))
            fp = sum(a == 0 and p == 1 for a, p in zip(actual, predicted))
            fn = sum(a == 1 and p == 0 for a, p in zip(actual, predicted))
            precision = tp / (tp + fp) if tp + fp else None
            recall = tp / (tp + fn) if tp + fn else None
            return {"tp": tp, "tn": tn, "fp": fp, "fn": fn, "precision": None if precision is None else round(precision, 3), "recall": None if recall is None else round(recall, 3)}
      hints: *id002
    check:
      id: python.numpy.numpy_06.binary-confusion-metrics.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.numpy.numpy_06.binary-confusion-metrics.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: binary_metrics
        cases:
        - id: computes-confusion-and-rates
          arguments:
          - value:
            - 1
            - 1
            - 0
            - 0
            - 1
          - value:
            - 1
            - 0
            - 1
            - 0
            - 1
          expectedReturn:
            tp: 2
            tn: 1
            fp: 1
            fn: 1
            precision: 0.667
            recall: 0.667
        - id: handles-no-positive-predictions
          arguments:
          - value:
            - 1
            - 0
          - value:
            - 0
            - 0
          expectedReturn:
            tp: 0
            tn: 1
            fp: 0
            fn: 1
            precision: null
            recall: 0.0
        - id: rejects-misaligned-labels
          arguments:
          - value:
            - 1
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: numpy_06-risk-analysis-boundary-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - numpy_06-binary-confusion-metrics-transfer
    title: 위험 분석 결과의 해석 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 상관 feature, 예측 score, 의료 진단의 증거 수준을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 데이터 분석 수치를 진단이나 치료 조언으로 확대하지 마세요.
    - 예측 성능은 학습 데이터가 아니라 held-out 결과로 설명하세요.
    exercise:
      prompt: choose_risk_claim(situation)를 완성해 allowedClaim, evidence, forbidden을 반환하세요.
      starterCode: |-
        def choose_risk_claim(situation):
            raise NotImplementedError
      solution: |
        def choose_risk_claim(situation):
            table = {'feature-association': {'allowedClaim': 'associated in this dataset', 'evidence': 'effect and sample size', 'forbidden': 'causes disease'}, 'prediction-score': {'allowedClaim': 'model risk estimate', 'evidence': 'held-out metrics', 'forbidden': 'clinical diagnosis'}, 'screening-rule': {'allowedClaim': 'rule flag', 'evidence': 'threshold and confusion matrix', 'forbidden': 'treatment advice'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.numpy.numpy_06.risk-analysis-boundary.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.numpy.numpy_06.risk-analysis-boundary.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_risk_claim
        cases:
        - id: recalls-feature-association
          arguments:
          - value: feature-association
          expectedReturn:
            allowedClaim: associated in this dataset
            evidence: effect and sample size
            forbidden: causes disease
        - id: recalls-prediction-score
          arguments:
          - value: prediction-score
          expectedReturn:
            allowedClaim: model risk estimate
            evidence: held-out metrics
            forbidden: clinical diagnosis
        - id: rejects-unknown-situation
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};