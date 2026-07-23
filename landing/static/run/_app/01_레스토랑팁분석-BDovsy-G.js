var e=`meta:
  packages:
  - pandas
  id: pandas_01
  title: 레스토랑팁분석
  order: 1
  category: pandas
  difficulty: ⭐
  badge: 입문
  dataSource: codaro-local:tips
  outcomes: ["pandas.loadFrame","pandas.filterSelect"]
  prerequisites: ["pandas.intro"]
  estimatedMinutes: 50
  tags:
  - tips
  - 기초
  - read_csv
  - describe
  seo:
    title: pandas 팁 데이터 분석 - read_csv, describe 기초
    description: 레스토랑 팁 데이터로 pandas 기초를 배웁니다. CSV 불러오기, DataFrame 구조, 컬럼 선택, 평균/최대/최소 통계를 실습합니다.
    keywords:
    - pandas read_csv
    - DataFrame
    - describe
    - mean
    - 팁 데이터분석
intro:
  emoji: 🍽️
  goal: 레스토랑 팁 데이터에서 "평균 팁은 얼마일까?"를 알아봅니다.
  description: pandas는 엑셀처럼 표 데이터를 다루는 도구입니다. 불러오기 → 구조 파악 → 컬럼 선택 → 통계의 흐름을 익힙니다.
  direction: 레스토랑팁분석에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.
  benefits:
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.
  - 레스토랑팁분석 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. pandas 불러오기 입력 확인
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. CSV 불러오기 처리 실행
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 표 확인하기 결과 검증
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.
    - label: 레스토랑팁분석 재사용
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표 데이터 환경
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 레스토랑팁분석 실행
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.
    - label: 레스토랑팁분석 완료
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.
sections:
- id: step1_import
  title: 1단계. pandas 불러오기
  structuredPrimary: true
  subtitle: import pandas as pd
  goal: 1단계. pandas 불러오기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    pandas는 파이썬에서 표(DataFrame) 형태의 데이터를 다루는 강력한 도구입니다. 엑셀의 시트와 비슷하게 행과 열로 구성된 데이터를 쉽게 분석할 수 있습니다. 데이터 과학과 분석 작업의 핵심 라이브러리로, CSV, 엑셀, 데이터베이스 등 다양한 형식의 데이터를 불러오고 처리할 수 있습니다.

    import pandas as pd는 pandas 라이브러리를 pd라는 짧은 이름으로 불러오는 관례입니다. pd.read_csv()처럼 매번 pandas.read_csv()라고 쓰지 않고 짧게 pd로 사용할 수 있습니다. 거의 모든 pandas 코드에서 이렇게 시작합니다. 참고로 as pd를 붙이지 않고 import pandas 상태에서는 pandas.read_csv같이 사용할 수 있습니다. 이때 pandas.read_csv가 너무 길어지니 줄여서 pd로 사용하겠단 의미로 import pandas as pd를 합니다.
  tips:
  - import pandas as pd는 pandas 라이브러리를 pd라는 짧은 이름으로 불러오는 관례입니다. pd.read_csv()처럼 매번 pandas.read_csv()라고
    쓰지 않고 짧게 pd로 사용할 수 있습니다. 거의 모든 pandas 코드에서 이렇게 시작합니다. 참고로 as pd를 붙이지 않고 import pandas 상태에서는 pandas.read_csv같이
    사용할 수 있습니다. 이때 pandas.read_csv가 너무 길어지니 줄여서 pd로 사용하겠단 의미로 import pandas as pd를 합니다.
  snippet: import pandas as pd
  exercise:
    prompt: 1단계. pandas 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import pandas as pd
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. pandas 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. pandas 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: step2_load
  title: 2단계. CSV 불러오기
  structuredPrimary: true
  subtitle: pd.read_csv()
  goal: 2단계. CSV 불러오기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    CSV(Comma-Separated Values)는 콤마로 구분된 텍스트 파일이며, pandas는 이런 표 데이터를 DataFrame으로 다룹니다. 이 레슨에서는 Codaro가 제공하는 로컬 예제 DataFrame으로 분석 흐름을 안정적으로 연습합니다.

    pd.read_csv()는 CSV 파일을 DataFrame으로 변환합니다. 이번 실습은 Codaro 로컬 데이터셋을 쓰므로 인터넷 연결과 무관하게 이후 셀을 그대로 실행할 수 있습니다.
  tips:
  - pd.read_csv()는 CSV 파일을 DataFrame으로 변환합니다. 이번 실습은 Codaro 로컬 데이터셋을 쓰므로 인터넷 연결과 무관하게 이후 셀을 그대로 실행할 수
    있습니다.
  snippet: |-
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset

    tips = loadLocalDataset("tips")
  exercise:
    prompt: 2단계. CSV 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset

      tips = loadLocalDataset("tips")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. CSV 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. CSV 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_preview
  title: 3단계. 표 확인하기
  structuredPrimary: true
  subtitle: 변수명만 입력
  goal: 3단계. 표 확인하기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: Jupyter나 Codaro 같은 노트북 환경에서는 변수명만 입력하면 자동으로 표 형태로 예쁘게 출력됩니다. 로컬 데이터셋은 레스토랑 손님 기록과 같은 7개
    컬럼을 가진 표입니다. 각 행에는 결제 금액, 팁, 성별, 흡연 여부, 요일, 시간대, 일행 수가 담겨 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: tips
  exercise:
    prompt: 3단계. 표 확인하기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: tips
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 표 확인하기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. 표 확인하기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step4_shape
  title: 4단계. 크기 확인
  structuredPrimary: true
  subtitle: .shape
  goal: 4단계. 크기 확인에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    shape 속성은 DataFrame의 크기를 (행 수, 열 수) 튜플 형태로 반환합니다. 로컬 데이터셋을 읽으면 행과 열 개수를 바로 확인할 수 있습니다. 데이터 분석을 시작할 때 전체 데이터의 규모를 파악하는 것이 중요합니다.

    .shape는 함수가 아니라 속성이므로 괄호 ()를 붙이지 않습니다. tips.shape()라고 쓰면 에러가 발생합니다. 속성은 값을 저장하고 있고, 메서드(함수)는 어떤 동작을 수행합니다.
  tips:
  - .shape는 함수가 아니라 속성이므로 괄호 ()를 붙이지 않습니다. tips.shape()라고 쓰면 에러가 발생합니다. 속성은 값을 저장하고 있고, 메서드(함수)는 어떤 동작을
    수행합니다.
  snippet: tips.shape
  exercise:
    prompt: 4단계. 크기 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: tips.shape
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 크기 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 4단계. 크기 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step5_head
  title: 5단계. 처음 5행 보기
  structuredPrimary: true
  subtitle: .head()
  goal: 5단계. 처음 5행 보기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: head() 메서드는 DataFrame의 처음 5행만 보여줍니다. 전체 데이터를 다 출력하면 화면이 너무 길어지므로, 데이터의 구조와 형태를 빠르게 파악할
    때 매우 유용합니다. 괄호 안에 숫자를 넣으면 원하는 개수만큼 볼 수 있습니다. 예를 들어 head(10)은 처음 10행을 출력합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: tips.head()
  exercise:
    prompt: 5단계. 처음 5행 보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: tips.head()
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 처음 5행 보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 5단계. 처음 5행 보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step6_columns
  title: 6단계. 컬럼 목록
  structuredPrimary: true
  subtitle: .columns
  goal: 6단계. 컬럼 목록에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: columns 속성은 DataFrame에 어떤 컬럼(열)들이 있는지 이름 목록을 보여줍니다. 데이터를 분석하기 전에 어떤 정보들이 포함되어 있는지 확인하는
    것이 중요합니다. 이 데이터에는 total_bill(총 결제 금액), tip(팁), sex(성별), smoker(흡연 여부), day(요일), time(시간대), size(일행
    수) 등이 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: tips.columns
  exercise:
    prompt: 6단계. 컬럼 목록 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: tips.columns
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 컬럼 목록의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 6단계. 컬럼 목록의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step7_select
  title: 7단계. tip 컬럼 선택
  structuredPrimary: true
  subtitle: 대괄호로 선택
  goal: 7단계. tip 컬럼 선택에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    DataFrame에서 특정 컬럼만 선택하려면 대괄호 []를 사용합니다. DataFrame['컬럼명'] 형태로 작성하면 해당 컬럼의 모든 값들을 Series 형태로 가져올 수 있습니다. Series는 pandas의 1차원 데이터 구조로, 하나의 열을 나타냅니다. 여기서는 로컬 예제 데이터에 담긴 손님의 팁 금액만 선택합니다.

    컬럼 선택 시 컬럼명은 반드시 따옴표로 감싸야 합니다. tips['tip']처럼 작은따옴표나 큰따옴표 모두 사용 가능합니다. 공백이나 특수문자가 포함된 컬럼명도 동일하게 선택할 수 있습니다.
  tips:
  - 컬럼 선택 시 컬럼명은 반드시 따옴표로 감싸야 합니다. tips['tip']처럼 작은따옴표나 큰따옴표 모두 사용 가능합니다. 공백이나 특수문자가 포함된 컬럼명도 동일하게 선택할
    수 있습니다.
  snippet: tips['tip']
  exercise:
    prompt: 7단계. tip 컬럼 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: tips['tip']
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. tip 컬럼 선택의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 7단계. tip 컬럼 선택 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step8_mean
  title: 8단계. 평균 팁 구하기
  structuredPrimary: true
  subtitle: .mean()
  goal: 8단계. 평균 팁 구하기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: Series나 DataFrame의 숫자 컬럼에 .mean() 메서드를 붙이면 평균값을 계산합니다. 이 프로젝트의 목표인 "평균 팁은 얼마일까?"의 답을 드디어
    구할 수 있습니다! 현재 불러온 모든 행의 팁을 더해서 개수로 나눈 값이 자동으로 계산됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: tips['tip'].mean()
  exercise:
    prompt: 8단계. 평균 팁 구하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: tips['tip'].mean()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 평균 팁 구하기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 8단계. 평균 팁 구하기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step9_maxmin
  title: 9단계. 최대/최소 팁
  structuredPrimary: true
  subtitle: .max(), .min()
  goal: 9단계. 최대/최소 팁에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: mean()과 마찬가지로 max()는 최대값, min()은 최소값을 구하는 메서드입니다. 평균뿐만 아니라 데이터의 범위(최소~최대)를 파악하면 데이터를 더
    잘 이해할 수 있습니다. 실행할 때마다 같은 로컬 데이터셋을 사용하므로 결과를 안정적으로 비교할 수 있습니다. 두 값을 콤마로 연결하면 한 번에 볼 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: tips['tip'].max(), tips['tip'].min()
  exercise:
    prompt: 9단계. 최대/최소 팁 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: tips['tip'].max(), tips['tip'].min()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. 최대/최소 팁의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 9단계. 최대/최소 팁 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step10_describe
  title: 10단계. 한번에 통계 보기
  structuredPrimary: true
  subtitle: .describe()
  goal: 10단계. 한번에 통계 보기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    describe() 메서드는 숫자 컬럼들의 주요 통계량을 한 번에 보여주는 매우 유용한 함수입니다. count(개수), mean(평균), std(표준편차), min(최소), 25%(1사분위수), 50%(중앙값), 75%(3사분위수), max(최대)가 자동으로 계산됩니다. 데이터 분석의 첫 단계에서 전체적인 데이터 분포를 파악하는 데 필수적입니다.

    describe()는 숫자형 컬럼만 자동으로 선택해서 통계를 보여줍니다. 문자형 컬럼(sex, day 등)은 제외됩니다. 만약 문자형 컬럼의 통계를 보고 싶다면 describe(include='object')를 사용하면 됩니다.
  tips:
  - describe()는 숫자형 컬럼만 자동으로 선택해서 통계를 보여줍니다. 문자형 컬럼(sex, day 등)은 제외됩니다. 만약 문자형 컬럼의 통계를 보고 싶다면 describe(include='object')를
    사용하면 됩니다.
  snippet: tips.describe()
  exercise:
    prompt: 10단계. 한번에 통계 보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: tips.describe()
    hints:
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 한번에 통계 보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 10단계. 한번에 통계 보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: workflow_validation
  title: 11단계. 실무 팁 리포트 검증
  structuredPrimary: true
  subtitle: 예측 → 오류 확인 → 검증 → 기준 실험
  goal: 11단계. 실무 팁 리포트 검증에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    평균 팁 하나만 보면 업무에 쓰기 어렵습니다. 실제 분석에서는 필수 컬럼을 확인하고, 잘못된 데이터가 들어왔을 때 바로 실패시키고, 계산 결과가 원본 행 수와 맞는지 검증해야 합니다. 이번 단계에서는 팁 비율이 가장 높은 요일을 먼저 예상하고, 컬럼이 빠진 데이터를 일부러 검사에 실패시킵니다. 그다음 요일별 리포트를 만들고, 결제 금액 기준을 바꿔 결과가 어떻게 달라지는지 실험합니다.

    변주 실험
    결제 금액 기준을 20/30달러가 아니라 15/25달러로 바꾸고, 주문 수와 평균 팁 비율이 어떻게 변하는지 같은 assert 구조로 비교하세요.
  tips:
  - 변주 실험 결제 금액 기준을 20/30달러가 아니라 15/25달러로 바꾸고, 주문 수와 평균 팁 비율이 어떻게 변하는지 같은 assert 구조로 비교하세요.
  snippet: |-
    def prepareTipMetrics(data):
        requiredColumns = {"total_bill", "tip", "day", "time", "size"}
        missingColumns = requiredColumns - set(data.columns)
        if missingColumns:
            raise ValueError(f"팁 분석에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")

        if (data["total_bill"] <= 0).any():
            raise ValueError("결제 금액은 0보다 커야 팁 비율을 계산할 수 있습니다.")

        result = data.copy()
        result["tipRate"] = result["tip"] / result["total_bill"]
        return result


    try:
        prepareTipMetrics(tips.drop(columns=["tip"]))
    except ValueError as exc:
        print("의도한 오류 확인:", exc)
    else:
        raise AssertionError("tip 컬럼이 빠진 데이터를 통과시키면 안 됩니다.")
  exercise:
    prompt: 11단계. 실무 팁 리포트 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def prepareTipMetrics(data):
          requiredColumns = {"total_bill", "tip", "day", "time", "size"}
          missingColumns = requiredColumns - set(data.columns)
          if missingColumns:
              raise ValueError(f"팁 분석에 필요한 컬럼이 없습니다: {sorted(missingColumns)}")

          if (data["total_bill"] <= 0).any():
              raise ValueError("결제 금액은 0보다 커야 팁 비율을 계산할 수 있습니다.")

          result = data.copy()
          result["tipRate"] = result["tip"] / result["total_bill"]
          return result


      try:
          prepareTipMetrics(tips.drop(columns=["tip"]))
      except ValueError as exc:
          print("의도한 오류 확인:", exc)
      else:
          raise AssertionError("tip 컬럼이 빠진 데이터를 통과시키면 안 됩니다.")
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 11단계. 실무 팁 리포트 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 실무 팁 리포트 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 팁 데이터 분석 프로젝트
  goal: 실습에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    레스토랑 매니저가 되어 배운 모든 개념을 활용해서 팁 데이터를 분석해봅시다. 데이터 불러오기, 컬럼 선택, 통계 계산(mean, max, min, describe) 등 지금까지 배운 내용을 모두 사용합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset

    data = loadLocalDataset("tips")
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset

      data = loadLocalDataset("tips")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: 데이터 분석의 기본 흐름을 익혔습니다.
  - type: list
    items:
    - import pandas as pd - pandas 불러오기
    - loadLocalDataset("tips") - Codaro 로컬 예제 데이터를 DataFrame으로
    - df.shape - 크기 (행, 열)
    - df.head() - 처음 5행
    - df.columns - 컬럼 목록
    - df['컬럼명'] - 특정 컬럼 선택
    - df['컬럼명'].mean() - 평균
    - df['컬럼명'].max() - 최대값
    - df['컬럼명'].min() - 최소값
    - df.describe() - 전체 통계 요약
  - type: text
    content: 다음 시간에는 타이타닉 데이터로 조건 필터링을 배웁니다.
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
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
  - id: pandas_01-tip-rate-summary-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - summary
    title: 결제 금액 조건을 적용해 팁 비율 요약하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 최소 결제 금액을 통과한 주문의 평균 팁 비율과 최고 결제 주문을 계산한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 팁 금액 자체가 아니라 tip / total 비율을 비교하세요.
    - 선택된 행이 없을 때 0으로 나누지 말고 None으로 명시하세요.
    exercise:
      prompt: summarize_tips(rows, minimum_total)를 완성해 qualifyingCount, averageTipRate, highestBillId를 반환하세요.
      starterCode: |-
        def summarize_tips(rows, minimum_total):
            raise NotImplementedError
      solution: |
        def summarize_tips(rows, minimum_total):
            if minimum_total < 0 or any(row["total"] <= 0 for row in rows):
                raise ValueError("bill totals must be positive")
            selected = [row for row in rows if row["total"] >= minimum_total]
            if not selected:
                return {"qualifyingCount": 0, "averageTipRate": None, "highestBillId": None}
            rates = [row["tip"] / row["total"] for row in selected]
            highest = max(selected, key=lambda row: (row["total"], row["id"]))
            return {
                "qualifyingCount": len(selected),
                "averageTipRate": round(sum(rates) / len(rates), 4),
                "highestBillId": highest["id"],
            }
      hints: *id001
    check:
      id: python.pandas.pandas_01.tip-rate-summary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pandas.pandas_01.tip-rate-summary.mastery.behavior.v1.fixture
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
        entry: summarize_tips
        cases:
        - id: filters-and-computes-rates
          arguments:
          - value:
            - id: A
              total: 20
              tip: 4
            - id: B
              total: 40
              tip: 6
            - id: C
              total: 10
              tip: 1
          - value: 20
          expectedReturn:
            qualifyingCount: 2
            averageTipRate: 0.175
            highestBillId: B
        - id: reports-empty-selection
          arguments:
          - value:
            - id: A
              total: 10
              tip: 1
          - value: 20
          expectedReturn:
            qualifyingCount: 0
            averageTipRate: null
            highestBillId: null
        - id: rejects-zero-total
          arguments:
          - value:
            - id: A
              total: 0
              tip: 0
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pandas_01-service-shift-comparison-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pandas_01-tip-rate-summary-mastery
    title: 새 카페 데이터에서 근무 시간대별 서비스 비율 비교하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 팁 분석 규칙을 day 대신 shift 그룹에 옮겨 가장 높은 시간대를 찾는다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 그룹별 비율을 먼저 만든 뒤 평균을 계산하세요.
    - 동률일 때 결과가 흔들리지 않도록 그룹 이름으로 한 번 더 정렬하세요.
    exercise:
      prompt: compare_service_shifts(rows)를 완성해 byShift와 bestShift를 반환하세요.
      starterCode: |-
        def compare_service_shifts(rows):
            raise NotImplementedError
      solution: |
        def compare_service_shifts(rows):
            grouped = {}
            for row in rows:
                if row["bill"] <= 0:
                    raise ValueError("bill must be positive")
                grouped.setdefault(row["shift"], []).append(row["service"] / row["bill"])
            by_shift = {key: round(sum(values) / len(values), 3) for key, values in sorted(grouped.items())}
            best = max(by_shift, key=lambda key: (by_shift[key], key)) if by_shift else None
            return {"byShift": by_shift, "bestShift": best}
      hints: *id002
    check:
      id: python.pandas.pandas_01.service-shift-comparison.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pandas.pandas_01.service-shift-comparison.transfer.behavior.v1.fixture
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
        entry: compare_service_shifts
        cases:
        - id: compares-two-shifts
          arguments:
          - value:
            - shift: lunch
              bill: 20
              service: 2
            - shift: dinner
              bill: 20
              service: 4
            - shift: lunch
              bill: 10
              service: 2
          expectedReturn:
            byShift:
              dinner: 0.2
              lunch: 0.15
            bestShift: dinner
        - id: handles-no-rows
          arguments:
          - value: []
          expectedReturn:
            byShift: {}
            bestShift: null
        - id: rejects-invalid-bill
          arguments:
          - value:
            - shift: night
              bill: -1
              service: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pandas_01-tip-metric-choice-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pandas_01-service-shift-comparison-transfer
    title: 팁 질문의 올바른 지표와 분모 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 금액, 비율, 그룹 비교 질문마다 필요한 metric과 denominator를 선택한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 큰 팁 금액과 높은 팁 비율은 다른 질문입니다.
    - 그룹 평균에는 그룹별 표본 수를 함께 남기세요.
    exercise:
      prompt: choose_tip_metric(question)를 완성해 metric, denominator, warning을 반환하세요.
      starterCode: |-
        def choose_tip_metric(question):
            raise NotImplementedError
      solution: |
        def choose_tip_metric(question):
            table = {
                "largest-tip-cash": {"metric": "tip", "denominator": None, "warning": "large bills dominate"},
                "fairest-tip-rate": {"metric": "tip / total", "denominator": "total", "warning": "exclude nonpositive totals"},
                "compare-groups": {"metric": "mean(tip / total)", "denominator": "rows per group", "warning": "show group counts"},
            }
            if question not in table:
                raise ValueError("unknown tip question")
            return table[question]
      hints: *id003
    check:
      id: python.pandas.pandas_01.tip-metric-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pandas.pandas_01.tip-metric-choice.retrieval.behavior.v1.fixture
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
        entry: choose_tip_metric
        cases:
        - id: recalls-rate-denominator
          arguments:
          - value: fairest-tip-rate
          expectedReturn:
            metric: tip / total
            denominator: total
            warning: exclude nonpositive totals
        - id: recalls-group-count-warning
          arguments:
          - value: compare-groups
          expectedReturn:
            metric: mean(tip / total)
            denominator: rows per group
            warning: show group counts
        - id: rejects-ambiguous-question
          arguments:
          - value: best-table
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};