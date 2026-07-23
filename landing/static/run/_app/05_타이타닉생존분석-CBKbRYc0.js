var e=`meta:
  packages:
  - altair
  - pandas
  id: altair_05
  title: 타이타닉생존분석
  order: 5
  category: altair
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - row
  - column
  - facet
  - transform_filter
  - titanic
  seo:
    title: Altair 패싯 차트 - 타이타닉 생존 분석
    description: Altair로 패싯 차트를 만들고 데이터를 필터링합니다. row/column, facet, transform_filter를 배웁니다.
    keywords:
    - altair facet
    - row column
    - transform_filter
    - titanic
intro:
  emoji: 🚢
  goal: 타이타닉 승객 데이터를 패싯 차트로 분할하고 생존율을 분석합니다.
  description: row/column 인코딩으로 차트를 분할하고, transform_filter로 데이터를 필터링합니다.
  direction: 타이타닉생존분석에서 데이터와 인코딩 규칙을 분리해 재사용 가능한 차트를 구성합니다.
  benefits:
  - 정리된 테이블 확인 후 채널 인코딩에 맞는 코드 입력을 고릅니다.
  - 타이타닉생존분석 결과를 스케일과 마크 매핑 기준으로 즉시 점검합니다.
  - 완료한 코드를 선언형 대시보드에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 불러오기 입력 확인
      detail: 입력 기준(정리된 테이블)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 막대 차트 처리 실행
      detail: 채널 인코딩 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 행 분할 결과 검증
      detail: 스케일과 마크 매핑 기준으로 실행 결과를 비교합니다.
    - label: 타이타닉생존분석 재사용
      detail: 완성 코드를 선언형 대시보드에 붙일 수 있게 정리합니다.
    runtime:
    - label: 선언형 차트 환경
      detail: altair, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 타이타닉생존분석 실행
      detail: 셀을 실행해 스케일과 마크 매핑와 예외 상태를 확인합니다.
    - label: 타이타닉생존분석 완료
      detail: 검증된 코드를 선언형 대시보드로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: seaborn-data
  goal: 1단계. 데이터 불러오기에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: Codaro 로컬 데이터셋에서 titanic 데이터를 불러옵니다. 타이타닉호 승객의 생존 여부와 정보가 담긴 데이터입니다. survived(생존여부), pclass(객실등급),
    sex(성별), age(나이), fare(요금), embarked(승선항) 등 컬럼이 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import altair as alt
    import pandas as pd
    import warnings
    warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')
    from codaro.curriculum.localData import loadLocalDataset

    titanic = loadLocalDataset("titanic")
  exercise:
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      import pandas as pd
      import warnings
      warnings.filterwarnings('ignore', message='.*is_pandas_dataframe.*')
      from codaro.curriculum.localData import loadLocalDataset

      titanic = loadLocalDataset("titanic")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_basic_bar
  title: 2단계. 기본 막대 차트
  structuredPrimary: true
  subtitle: 생존자 수 집계
  goal: 2단계. 기본 막대 차트에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    survived 컬럼은 0(사망)과 1(생존)로 구성됩니다. 생존 여부별 승객 수를 막대 차트로 표현합니다.

    survived:N에서 :N은 명목형입니다. 0, 1 숫자지만 범주로 취급합니다.
  snippet: |-
    chartSurvived = alt.Chart(titanic).mark_bar().encode(
        x='survived:N',
        y='count()',
        color='survived:N'
    )
    chartSurvived
  exercise:
    prompt: 2단계. 기본 막대 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartSurvived = alt.Chart(titanic).mark_bar().encode(
          x='survived:N',
          y='count()',
          color='survived:N'
      )
      chartSurvived
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 2단계. 기본 막대 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 2단계. 기본 막대 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step3_row_encoding
  title: 3단계. 행 분할
  structuredPrimary: true
  subtitle: row 인코딩
  goal: 3단계. 행 분할에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    row 인코딩으로 차트를 여러 행으로 분할합니다. encode() 괄호 안에 row='sex:N'을 추가하면 됩니다. 성별(sex)로 분할하면 남녀 생존율을 각각 따로 차트로 보여줍니다. 위아래로 두 개의 차트가 나열됩니다. 같은 차트를 여러 조건별로 나누어 보여주는 것을 "패싯(facet)"이라고 합니다.

    row는 "행"을 의미합니다. row='sex:N'은 성별 값(male, female)마다 행을 하나씩 만들어 차트를 위아래로 배치합니다. column은 "열"을 의미하며, 차트를 좌우로 배치합니다. row와 column을 함께 사용하면 2차원 그리드를 만들 수 있습니다.
  tips:
  - row는 "행"을 의미합니다. row='sex:N'은 성별 값(male, female)마다 행을 하나씩 만들어 차트를 위아래로 배치합니다. column은 "열"을 의미하며, 차트를
    좌우로 배치합니다. row와 column을 함께 사용하면 2차원 그리드를 만들 수 있습니다.
  snippet: |-
    chartRow = alt.Chart(titanic).mark_bar().encode(
        x='survived:N',
        y='count()',
        color='survived:N',
        row='sex:N'
    )
    chartRow
  exercise:
    prompt: 3단계. 행 분할 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartRow = alt.Chart(titanic).mark_bar().encode(
          x='survived:N',
          y='count()',
          color='survived:N',
          row='sex:N'
      )
      chartRow
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 3단계. 행 분할의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 행 분할의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step4_column_encoding
  title: 4단계. 열 분할
  structuredPrimary: true
  subtitle: column 인코딩
  goal: 4단계. 열 분할에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    column 인코딩으로 차트를 가로로 분할합니다. 객실 등급(pclass)으로 분할해봅니다.

    pclass는 1, 2, 3등급으로 순서가 있어 :O(순서형)를 사용합니다. 1등급 생존율이 가장 높습니다.
  snippet: |-
    chartColumn = alt.Chart(titanic).mark_bar().encode(
        x='survived:N',
        y='count()',
        color='survived:N',
        column='pclass:O'
    )
    chartColumn
  exercise:
    prompt: 4단계. 열 분할 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartColumn = alt.Chart(titanic).mark_bar().encode(
          x='survived:N',
          y='count()',
          color='survived:N',
          column='pclass:O'
      )
      chartColumn
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 4단계. 열 분할의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 4단계. 열 분할의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step5_row_column
  title: 5단계. 행+열 분할
  structuredPrimary: true
  subtitle: 2차원 패싯
  goal: 5단계. 행+열 분할에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: row와 column을 함께 사용하면 2차원 그리드로 분할됩니다. 성별(row)과 등급(column)의 조합별 생존율을 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    chartGrid = alt.Chart(titanic).mark_bar().encode(
        x='survived:N', y='count()', color='survived:N',
        row='sex:N', column='pclass:O'
    ).properties(width=120, height=100)
    chartGrid
  exercise:
    prompt: 5단계. 행+열 분할 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartGrid = alt.Chart(titanic).mark_bar().encode(
          x='survived:N', y='count()', color='survived:N',
          row='sex:N', column='pclass:O'
      ).properties(width=120, height=100)
      chartGrid
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 5단계. 행+열 분할의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 5단계. 행+열 분할의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step6_transform_filter
  title: 6단계. 데이터 필터링
  structuredPrimary: true
  subtitle: transform_filter
  goal: 6단계. 데이터 필터링에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    transform_filter()로 특정 조건의 데이터만 시각화합니다. 필터는 "걸러낸다"는 의미로, 원하는 데이터만 선택합니다. 1등급 승객만 필터링해봅니다. encode() 뒤에 .transform_filter()를 연결합니다. alt.datum.pclass == 1은 "pclass 컬럼 값이 1인 것만"이라는 조건입니다. alt.datum은 "각 데이터 행"을 의미하고, 점(.)으로 컬럼명을 연결합니다. ==는 "같다"를 의미하는 비교 연산자입니다. =(할당)과 다릅니다.

    비교 연산자: == (같다), != (다르다), < (작다), > (크다), <= (작거나 같다), >= (크거나 같다) 논리 연산자: & (AND, 그리고), | (OR, 또는). 여러 조건을 결합할 때 사용합니다. 괄호로 각 조건을 감싸야 합니다.
  tips:
  - '비교 연산자: == (같다), != (다르다), < (작다), > (크다), <= (작거나 같다), >= (크거나 같다) 논리 연산자: & (AND, 그리고), | (OR,
    또는). 여러 조건을 결합할 때 사용합니다. 괄호로 각 조건을 감싸야 합니다.'
  snippet: |-
    chartFilter = alt.Chart(titanic).mark_bar().encode(
        x='sex:N',
        y='count()',
        color='survived:N'
    ).transform_filter(
        alt.datum.pclass == 1
    ).properties(
        title='1등급 승객 생존율'
    )
    chartFilter
  exercise:
    prompt: 6단계. 데이터 필터링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartFilter = alt.Chart(titanic).mark_bar().encode(
          x='sex:N',
          y='count()',
          color='survived:N'
      ).transform_filter(
          alt.datum.pclass == 1
      ).properties(
          title='1등급 승객 생존율'
      )
      chartFilter
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 6단계. 데이터 필터링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. 데이터 필터링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_multi_filter
  title: 7단계. 복합 필터
  structuredPrimary: true
  subtitle: 다중 조건
  goal: 7단계. 복합 필터에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 여러 조건을 결합해 필터링할 수 있습니다. & 연산자로 "그리고" 조건을 만듭니다. 성인(age >= 18) 여성(sex == 'female') 승객만 필터링합니다.
    (조건1) & (조건2) 형태로 씁니다. 각 조건을 괄호로 감싸야 합니다. 괄호 없이 쓰면 에러가 발생합니다. 문자열(female)은 작은따옴표로 감쌉니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    chartMultiFilter = alt.Chart(titanic).mark_bar().encode(
        x='pclass:O',
        y='count()',
        color='survived:N'
    ).transform_filter(
        (alt.datum.age >= 18) & (alt.datum.sex == 'female')
    ).properties(
        title='성인 여성 등급별 생존율'
    )
    chartMultiFilter
  exercise:
    prompt: 7단계. 복합 필터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartMultiFilter = alt.Chart(titanic).mark_bar().encode(
          x='pclass:O',
          y='count()',
          color='survived:N'
      ).transform_filter(
          (alt.datum.age >= 18) & (alt.datum.sex == 'female')
      ).properties(
          title='성인 여성 등급별 생존율'
      )
      chartMultiFilter
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 7단계. 복합 필터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 복합 필터의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_facet
  title: 8단계. facet 메서드
  structuredPrimary: true
  subtitle: 유연한 분할
  goal: 8단계. facet 메서드에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    facet() 메서드는 row/column 인코딩보다 유연합니다. properties() 뒤에 .facet()을 연결합니다. facet('embarked:N')은 승선 항구별로 차트를 나눕니다. columns=3은 한 줄에 3개씩 배치하라는 의미입니다. row/column은 encode() 안에 쓰지만, facet()은 메서드로 마지막에 연결합니다. facet()이 더 유연하게 레이아웃을 조정할 수 있습니다.

    메서드 체이닝 순서: mark_bar() → encode() → properties() → facet() 순으로 연결합니다. 각 단계는 점(.)으로 연결되며, 순서를 바꾸면 에러가 발생할 수 있습니다.
  tips:
  - '메서드 체이닝 순서: mark_bar() → encode() → properties() → facet() 순으로 연결합니다. 각 단계는 점(.)으로 연결되며, 순서를 바꾸면
    에러가 발생할 수 있습니다.'
  snippet: |-
    chartFacet = alt.Chart(titanic).mark_bar().encode(
        x='survived:N', y='count()', color='survived:N'
    ).properties(width=100, height=80).facet('embarked:N', columns=3)
    chartFacet
  exercise:
    prompt: 8단계. facet 메서드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartFacet = alt.Chart(titanic).mark_bar().encode(
          x='survived:N', y='count()', color='survived:N'
      ).properties(width=100, height=80).facet('embarked:N', columns=3)
      chartFacet
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 8단계. facet 메서드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. facet 메서드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step9_final
  title: 9단계. 최종 결과물
  structuredPrimary: true
  subtitle: 타이타닉 생존 분석
  goal: 9단계. 최종 결과물에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    지금까지 배운 개념을 종합해 타이타닉 생존 분석 차트를 완성합니다. 성별, 등급별 생존율을 한눈에 비교합니다.

    여성과 1등급 승객의 생존율이 높습니다. "여성과 어린이 먼저"라는 당시 관행이 데이터에 반영되어 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    chartFinal = alt.Chart(titanic).mark_bar().encode(
        x=alt.X('survived:N', title='생존 여부', axis=alt.Axis(labelExpr="datum.value == 1 ? '생존' : '사망'")),
        y=alt.Y('count()', title='승객 수'),
        color=alt.Color('survived:N', title='생존', legend=None),
        row=alt.Row('sex:N', title='성별'), column=alt.Column('pclass:O', title='객실 등급')
    ).properties(width=100, height=80)
    chartFinal
  exercise:
    prompt: 9단계. 최종 결과물 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      chartFinal = alt.Chart(titanic).mark_bar().encode(
          x=alt.X('survived:N', title='생존 여부', axis=alt.Axis(labelExpr="datum.value == 1 ? '생존' : '사망'")),
          y=alt.Y('count()', title='승객 수'),
          color=alt.Color('survived:N', title='생존', legend=None),
          row=alt.Row('sex:N', title='성별'), column=alt.Column('pclass:O', title='객실 등급')
      ).properties(width=100, height=80)
      chartFinal
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 9단계. 최종 결과물의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 최종 결과물의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 타이타닉 패싯 프로젝트
  goal: 실습에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    이 프로젝트에서 배운 내용을 정리합니다. row와 column으로 차트를 행과 열로 분할했습니다. 2차원 그리드를 만들 수 있습니다. transform_filter()로 조건에 맞는 데이터만 필터링했습니다. alt.datum.컬럼명으로 조건을 지정하고, ==, &, | 연산자를 사용합니다. facet() 메서드로 유연하게 패싯 차트를 만들었습니다. columns로 레이아웃을 조정할 수 있습니다. 각 미션에서 이 개념들을 활용해봅시다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import altair as alt
    import pandas as pd
    from codaro.curriculum.localData import loadLocalDataset
    ship = loadLocalDataset("titanic")
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      import pandas as pd
      from codaro.curriculum.localData import loadLocalDataset
      ship = loadLocalDataset("titanic")
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  blocks:
  - type: text
    content: Altair로 패싯 차트와 필터링을 마스터했습니다!
  - type: list
    items:
    - row='컬럼:N' - 행 방향으로 차트 분할
    - column='컬럼:N' - 열 방향으로 차트 분할
    - row + column - 2차원 그리드 분할
    - transform_filter(alt.datum.컬럼 == 값) - 데이터 필터링
    - '&, | 연산자 - 다중 조건 결합'
    - .facet('컬럼:N', columns=n) - 유연한 패싯
  - type: text
    content: 다음 프로젝트에서는 항공편 데이터로 히트맵과 박스플롯을 배웁니다.
  goal: 정리에서 정리된 테이블을 바꿨을 때 스케일과 마크 매핑가 어떻게 달라지는지 확인한다.
  why: 선언형 차트는 데이터 필드와 시각 표현의 관계를 명확하게 관리하게 해줍니다.
- id: workflow_validation
  title: 10단계. 타이타닉 Facet 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주
  goal: 10단계. 타이타닉 Facet 검증 루프에서 채널 인코딩 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    Facet 차트는 여러 집단을 동시에 비교하므로 생존 컬럼의 의미, 집단 표본, row/column 사양을 함께 확인해야 합니다.

    Facet은 비교 대상을 늘리는 기능이지만, 생존율의 기준과 표본 검증 없이는 결론을 강하게 말할 수 없습니다.
  snippet: |-
    import altair as alt
    from codaro.curriculum.localData import loadLocalDataset

    titanicFlow = loadLocalDataset("titanic")
    requiredColumns = {"survived", "pclass", "sex", "age", "fare"}
    missingColumns = requiredColumns - set(titanicFlow.columns)

    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
    assert set(titanicFlow["survived"].unique()).issubset({0, 1})
    assert titanicFlow.groupby("sex")["survived"].mean()["female"] > titanicFlow.groupby("sex")["survived"].mean()["male"]
  exercise:
    prompt: 10단계. 타이타닉 Facet 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import altair as alt
      from codaro.curriculum.localData import loadLocalDataset

      titanicFlow = loadLocalDataset("titanic")
      requiredColumns = {"survived", "pclass", "sex", "age", "fare"}
      missingColumns = requiredColumns - set(titanicFlow.columns)

      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
      assert set(titanicFlow["survived"].unique()).issubset({0, 1})
      assert titanicFlow.groupby("sex")["survived"].mean()["female"] > titanicFlow.groupby("sex")["survived"].mean()["male"]
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 10단계. 타이타닉 Facet 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 10단계. 타이타닉 Facet 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: altair_05-titanic-aggregate-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 타이타닉 생존 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: binary mean이 생존율이며 NULL 분모를 제외한다고 명시했는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_titanic_aggregate(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_titanic_aggregate(rows):
            raise NotImplementedError
      solution: |
        def prepare_titanic_aggregate(rows):
            required = ['pclass', 'survivalRate', 'sex']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'sex'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['pclass'] for row in usable]
            y_values = [row['survivalRate'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.altair.altair_05.titanic-aggregate-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_05.titanic-aggregate-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_titanic_aggregate
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - pclass: 1
              survivalRate: 0.9
              sex: F
            - pclass: 1
              survivalRate: 0.4
              sex: M
            - pclass: 3
              survivalRate: null
              sex: M
          expectedReturn:
            usableCount: 2
            excludedCount: 1
            groupCounts:
              F: 1
              M: 1
            xExtent:
            - 1
            - 1
            yExtent:
            - 0.4
            - 0.9
        - id: handles-empty-data
          arguments:
          - value: []
          expectedReturn:
            usableCount: 0
            excludedCount: 0
            groupCounts: {}
            xExtent: null
            yExtent: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: altair_05-titanic-aggregate-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - altair_05-titanic-aggregate-data-evidence-mastery
    title: 타이타닉 생존 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 요금제·채널별 전환율을 known outcome count와 함께 집계한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_titanic_aggregate(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_titanic_aggregate(candidate):
            raise NotImplementedError
      solution: |
        def audit_titanic_aggregate(candidate):
            expected = {'mark': 'bar', 'x': 'pclass', 'y': 'survivalRate', 'group': 'sex', 'transforms': ['mean-binary', 'valid-count'], 'interaction': 'hover'}
            errors = []
            for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
                actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
                if actual != expected[name]:
                    errors.append(name)
            if not str(candidate.get("description", "")).strip():
                errors.append("description")
            return {"valid": not errors, "errors": errors, "encoding": expected}
      hints: *id002
    check:
      id: python.altair.altair_05.titanic-aggregate-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_05.titanic-aggregate-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_titanic_aggregate
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: bar
              x: pclass
              y: survivalRate
              group: sex
              transforms:
              - mean-binary
              - valid-count
              interaction: hover
              description: 요금제·채널별 전환율을 known outcome count와 함께 집계한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: bar
              x: pclass
              y: survivalRate
              group: sex
              transforms:
              - mean-binary
              - valid-count
              interaction: hover
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: survivalRate
              y: pclass
              group: null
              transforms: []
              interaction: none
              description: ''
          expectedReturn:
            valid: false
            errors:
            - mark
            - x
            - y
            - group
            - transforms
            - interaction
            - description
            encoding:
              mark: bar
              x: pclass
              y: survivalRate
              group: sex
              transforms:
              - mean-binary
              - valid-count
              interaction: hover
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: altair_05-titanic-aggregate-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - altair_05-titanic-aggregate-encoding-transfer-transfer
    title: 타이타닉 생존 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: binary mean이 생존율이며 NULL 분모를 제외한다고 명시했는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_titanic_aggregate(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_titanic_aggregate(situation):
            raise NotImplementedError
      solution: |
        def choose_titanic_aggregate(situation):
            table = {'binary-mean': {'encoding': 'mean with percent format', 'evidence': 'known n', 'risk': 'NULL as zero'}, 'uncertainty': {'encoding': 'interval layer', 'evidence': 'interval method', 'risk': 'tiny group certainty'}, 'raw-count': {'encoding': 'count bar', 'evidence': 'all rows', 'risk': 'count called rate'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.altair.altair_05.titanic-aggregate-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.altair.altair_05.titanic-aggregate-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_titanic_aggregate
        cases:
        - id: recalls-binary-mean
          arguments:
          - value: binary-mean
          expectedReturn:
            encoding: mean with percent format
            evidence: known n
            risk: NULL as zero
        - id: recalls-uncertainty
          arguments:
          - value: uncertainty
          expectedReturn:
            encoding: interval layer
            evidence: interval method
            risk: tiny group certainty
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};