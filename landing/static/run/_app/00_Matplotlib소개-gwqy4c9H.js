var e=`meta:
  packages:
  - matplotlib
  - pandas
  id: matplotlib_00
  title: Matplotlib소개
  order: 0
  category: matplotlib
  badge: 소개
  source: eddmpython
  sourceUrl: https://eddmpython.com
  outcomes: ["matplotlib.basics"]
  prerequisites: ["pandas.loadFrame"]
  estimatedMinutes: 35
  tags:
  - Matplotlib
  - 시각화
  - 정적 차트
  - Figure
  - Axes
  - pyplot
  seo:
    title: Matplotlib 입문 - 파이썬 시각화의 기본
    description: Matplotlib으로 고품질 정적 차트를 만들어보세요. 논문, 보고서에 적합한 출판 품질의 시각화를 경험합니다.
    keywords:
    - Matplotlib
    - pyplot
    - 정적 차트
    - 데이터 시각화
    - Figure
    - Axes
intro:
  direction: Matplotlib소개에서 분석 데이터를 차트로 만들고 축, 범례, 저장 결과를 검증합니다.
  benefits:
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.
  - 시각화할 데이터 확인 후 차트 구성에 맞는 코드 입력을 고릅니다.
  - Matplotlib소개 결과를 축/범례/파일 출력 기준으로 즉시 점검합니다.
  - 완료한 코드를 보고서 차트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 업무 흐름 검증 입력 확인
      detail: 입력 기준(시각화할 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 차트 구성 처리 실행
      detail: 차트 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 축/범례/파일 출력 결과 검증
      detail: 축/범례/파일 출력 기준으로 실행 결과를 비교합니다.
    - label: Matplotlib소개 재사용
      detail: 완성 코드를 보고서 차트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 시각 리포트 환경
      detail: matplotlib, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: Matplotlib소개 실행
      detail: 셀을 실행해 축/범례/파일 출력와 예외 상태를 확인합니다.
    - label: Matplotlib소개 완료
      detail: 검증된 코드를 보고서 차트로 남깁니다.
sections:
- id: intro
  blocks:
  - type: mainHeader
    emoji: 📈
    title: Matplotlib
    subtitle: 파이썬 시각화의 시작점
  - type: hero
    emoji: 🎨
    title: 출판 품질의 시각화
    subtitle: 논문과 보고서를 위한 정적 차트
    points:
    - emoji: 📄
      title: PNG, PDF, SVG 고품질 저장
    - emoji: 🔧
      title: 픽셀 단위 세밀한 조정
    - emoji: 📊
      title: 모든 차트 유형 지원
    - emoji: 🏛️
      title: 20년 검증된 대표 시각화 패키지
  goal: Matplotlib에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: matplotlib_history
  blocks:
  - type: sectionHeader
    title: 🏛️ Matplotlib의 역사
    subtitle: 파이썬 시각화의 뿌리
  - type: text
    content: |-
      Matplotlib은 2003년 John Hunter가 만들었습니다. 당시 그는 뇌전증 환자의 뇌파 데이터를 분석하던 신경생물학자였습니다. MATLAB의 시각화 기능을 파이썬에서 사용하고 싶어서 시작된 프로젝트입니다.

      20년이 넘는 시간 동안 과학/공학 분야의 표준 시각화 도구로 자리잡았습니다. Seaborn, Pandas의 plot 기능, 심지어 일부 다른 시각화 라이브러리도 내부적으로 Matplotlib을 기반으로 합니다.
  - type: featureCards
    cards:
    - emoji: 🔬
      title: 과학 커뮤니티 표준
      description: Nature, Science 등 학술지 논문의 대부분이 Matplotlib 사용
    - emoji: 📚
      title: 방대한 문서와 예제
      description: 20년간 축적된 튜토리얼, 갤러리, Stack Overflow 답변
    - emoji: 🧬
      title: 다른 라이브러리의 기반
      description: Seaborn, Pandas plot 등이 Matplotlib 위에 구축됨
    - emoji: 🔧
      title: 완전한 제어권
      description: 그래프의 모든 요소를 픽셀 단위로 조정 가능
  goal: 🏛️ Matplotlib의 역사에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: visualization_tools
  blocks:
  - type: sectionHeader
    title: 🗺️ 파이썬 시각화 생태계
    subtitle: 다양한 도구들의 역할
  - type: text
    content: 파이썬에는 다양한 시각화 라이브러리가 있습니다. 각각 장단점이 있어서 용도에 맞게 선택하면 됩니다. Matplotlib을 먼저 배우면 다른 라이브러리를 이해하기
      쉬워집니다.
  - type: table
    headers:
    - 라이브러리
    - 특징
    - 주요 용도
    rows:
    - - Matplotlib
      - 정적 차트, 완전한 제어, 논문 품질
      - 논문, 보고서, 출판물
    - - Seaborn
      - 통계 시각화, 예쁜 기본 스타일
      - 탐색적 분석, 통계 차트
    - - Plotly
      - 인터랙티브, 웹 기반, 호버 정보
      - 대시보드, 웹 앱
    - - Altair
      - 선언형 문법, 간결한 코드
      - 빠른 프로토타이핑
    - - Bokeh
      - 대용량 데이터, 스트리밍
      - 실시간 대시보드
    - - Pandas plot
      - DataFrame에서 바로 시각화
      - 빠른 탐색
  - type: note
    style: info
    title: Matplotlib이 먼저인 이유
    content: Seaborn은 Matplotlib 위에 만들어졌고, Pandas plot도 내부적으로 Matplotlib을 사용합니다. Matplotlib의 Figure, Axes
      개념을 이해하면 다른 라이브러리도 쉽게 배울 수 있습니다.
  goal: 🗺️ 파이썬 시각화 생태계에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: figure_axes
  blocks:
  - type: sectionHeader
    title: 🖼️ Figure와 Axes 이해하기
    subtitle: Matplotlib의 핵심 구조
  - type: text
    content: |-
      Matplotlib을 제대로 사용하려면 Figure와 Axes의 관계를 이해해야 합니다.

      Figure는 전체 그림판입니다. 도화지 한 장이라고 생각하세요. Axes는 실제 차트가 그려지는 영역입니다. 하나의 Figure에 여러 개의 Axes를 배치할 수 있습니다.
  - type: featureCards
    cards:
    - emoji: 🖼️
      title: Figure
      description: 전체 그림판. 크기, 해상도, 배경색 등을 설정
    - emoji: 📊
      title: Axes
      description: 실제 차트 영역. 데이터, 축, 제목 등을 설정
    - emoji: 📐
      title: Axis
      description: x축, y축. 눈금, 범위, 라벨 설정
    - emoji: 🎨
      title: Artist
      description: 화면에 그려지는 모든 요소 (선, 점, 텍스트 등)
  - type: note
    style: info
    title: pyplot vs 객체 지향
    content: plt.plot() 같은 pyplot 방식은 빠르게 그릴 때 편리합니다. fig, ax = plt.subplots() 같은 객체 지향 방식은 복잡한 차트를 세밀하게
      제어할 때 사용합니다. 이 과정에서는 두 방식 모두 배웁니다.
  goal: 🖼️ Figure와 Axes 이해하기에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: chart_types
  blocks:
  - type: sectionHeader
    title: 📊 지원하는 차트 종류
    subtitle: 기본부터 고급까지
  - type: table
    headers:
    - 카테고리
    - 차트 종류
    - 함수
    rows:
    - - 기본
      - 선 그래프
      - plot()
    - - 기본
      - 산점도
      - scatter()
    - - 기본
      - 막대 그래프
      - bar(), barh()
    - - 기본
      - 히스토그램
      - hist()
    - - 기본
      - 파이 차트
      - pie()
    - - 분포
      - 박스 플롯
      - boxplot()
    - - 분포
      - 바이올린 플롯
      - violinplot()
    - - 고급
      - 히트맵
      - imshow(), pcolormesh()
    - - 고급
      - 등고선
      - contour(), contourf()
    - - 고급
      - 3D 플롯
      - Axes3D
    - - 고급
      - 오차 막대
      - errorbar()
    - - 특수
      - 극좌표
      - projection='polar'
    - - 특수
      - 지도
      - Basemap, Cartopy 연동
  goal: 📊 지원하는 차트 종류에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: projects_preview
  blocks:
  - type: sectionHeader
    title: 🗺️ 10개 프로젝트 미리보기
    subtitle: 이 순서대로 배웁니다
  - type: table
    headers:
    - 단계
    - 프로젝트
    - 배울 내용
    rows:
    - - 입문
      - 01 주가추세분석
      - plot, figure, title, legend, grid
    - - 입문
      - 02 팁데이터분포탐색
      - hist, boxplot, subplots, color
    - - 기초
      - 03 붓꽃품종산점도
      - scatter, legend, marker, text
    - - 기초
      - 04 대륙별인구비교
      - bar, xticks, annotate
    - - 기초
      - 05 펭귄체중분석
      - violin, boxplot, sharex, spines
    - - 중급
      - 06 상관관계히트맵
      - imshow, cmap, colorbar
    - - 중급
      - 07 시계열다중축차트
      - twinx, fill_between, 이중 축
    - - 중급
      - 08 다중패널대시보드
      - GridSpec, style, tight_layout
    - - 심화
      - 09 고급주석차트
      - annotate, LaTeX, bbox, errorbar
    - - 심화
      - 10 종합분석리포트
      - 모든 개념 종합, savefig, dpi
  - type: note
    style: info
    title: 프로젝트 기반 학습
    content: 각 프로젝트는 완성된 결과물을 만듭니다. 개념을 배우면서 실제 분석 차트를 그려봅니다.
  goal: 🗺️ 10개 프로젝트 미리보기에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: styling
  blocks:
  - type: sectionHeader
    title: 🎨 스타일링 기능
    subtitle: 전문가 수준의 차트 디자인
  - type: featureCards
    cards:
    - emoji: 🎨
      title: 스타일 시트
      description: ggplot, seaborn, dark_background 등 내장 스타일
    - emoji: 🖌️
      title: 색상 팔레트
      description: viridis, plasma, coolwarm 등 과학적 컬러맵
    - emoji: ✏️
      title: 폰트 설정
      description: 글꼴, 크기, 굵기 완전 제어
    - emoji: 📏
      title: 레이아웃
      description: 여백, 간격, 정렬 세밀하게 조정
  - type: note
    style: tip
    title: 스타일 시트 활용
    content: plt.style.use('seaborn-v0_8-whitegrid')처럼 한 줄로 전체 스타일을 바꿀 수 있습니다. 직접 모든 걸 설정하지 않아도 됩니다.
  goal: 🎨 스타일링 기능에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: save_formats
  blocks:
  - type: sectionHeader
    title: 💾 저장 형식
    subtitle: 용도에 맞는 포맷 선택
  - type: table
    headers:
    - 형식
    - 특징
    - 추천 용도
    rows:
    - - PNG
      - 래스터, 투명 배경 가능
      - 웹, 프레젠테이션
    - - PDF
      - 벡터, 확대해도 선명
      - 논문, 출판물
    - - SVG
      - 벡터, 웹 편집 가능
      - 웹, 일러스트레이터
    - - EPS
      - 벡터, LaTeX 호환
      - 학술 논문
  - type: note
    style: info
    title: 해상도 설정
    content: plt.savefig('chart.png', dpi=300)으로 고해상도 이미지를 저장할 수 있습니다. 인쇄용은 300dpi, 웹용은 72-150dpi가 적당합니다.
  goal: 💾 저장 형식에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: when_to_use
  blocks:
  - type: sectionHeader
    title: ⚖️ 언제 Matplotlib을 선택할까?
    subtitle: 상황별 가이드
  - type: table
    headers:
    - 상황
    - 적합도
    - 이유
    rows:
    - - 논문/보고서 삽입
      - O
      - 고품질 정적 이미지 저장
    - - 세밀한 커스터마이징
      - O
      - 모든 요소 픽셀 단위 제어
    - - 고해상도 이미지 필요
      - O
      - 300dpi 이상 출력 가능
    - - 3D 시각화
      - O
      - Axes3D 지원
    - - 탐색적 데이터 분석
      - △
      - 가능하지만 코드가 길어질 수 있음
    - - 웹 대시보드
      - X
      - 정적 이미지만 가능
    - - 상호작용 필요
      - X
      - 줌/팬/호버 미지원
  - type: note
    style: tip
    title: 정적 시각화의 장점
    content: 인터랙티브 차트는 웹에서 편리하지만, 논문이나 보고서에 넣을 때는 고해상도 이미지가 필요합니다. Matplotlib은 이런 상황에 최적화되어 있습니다.
  goal: ⚖️ 언제 Matplotlib을 선택할까?에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: resources
  blocks:
  - type: sectionHeader
    title: 📚 참고 자료
    subtitle: 더 깊이 공부하고 싶다면
  - type: links
    items:
    - text: Matplotlib 공식 문서
      url: https://matplotlib.org/stable/
      icon: 🔗
    - text: Matplotlib 갤러리
      url: https://matplotlib.org/stable/gallery/
      icon: 🔗
    - text: Matplotlib Cheatsheets
      url: https://matplotlib.org/cheatsheets/
      icon: 🔗
    - text: Scientific Visualization Book
      url: https://github.com/rougier/scientific-visualization-book
      icon: 🔗
  goal: 📚 참고 자료에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: next
  blocks:
  - type: hero
    emoji: 👉
    title: '다음: 주가 추세 분석'
    subtitle: 선 그래프로 일별 주가 변동을 시각화합니다
  goal: '다음: 주가 추세 분석에서 시각화할 데이터을 바꿨을 때 축/범례/파일 출력가 어떻게 달라지는지 확인한다.'
  why: 시각화는 데이터 결과를 사람이 검토하고 의사결정에 쓰기 위한 산출물입니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: 보고서 차트 품질 게이트
  goal: 업무 흐름 검증에서 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: Matplotlib 학습은 차트를 그리는 데서 끝나면 부족합니다. 업무용 차트는 입력 데이터가 맞는지 검증하고, 잘못된 컬럼이나 음수 금액을 오류로 막고,
    제목·축·범례·기준선이 실제 보고서 기준을 만족하는지 확인해야 합니다. 마지막에는 목표선을 바꾸는 변주로 메시지가 어떻게 달라지는지 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pandas as pd
    import matplotlib.pyplot as plt

    reportData = pd.DataFrame({
        "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "revenue": [82, 91, 105, 112, 121, 130],
        "cost": [55, 58, 62, 64, 68, 72],
        "target": [100, 100, 100, 100, 100, 100],
    })

    def validateChartFrame(frame: pd.DataFrame) -> bool:
        requiredColumns = {"month", "revenue", "cost", "target"}
        missingColumns = requiredColumns - set(frame.columns)
        if missingColumns:
            raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")
        if frame[["revenue", "cost", "target"]].lt(0).any().any():
            raise ValueError("금액 컬럼은 음수가 될 수 없습니다.")
        return True

    validateChartFrame(reportData)
    reportData
  exercise:
    prompt: 업무 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      targetScenario = pd.DataFrame({"target": [95, 100, 115]}).assign(
          monthsPassed=lambda frame: frame["target"].map(lambda target: int((reportData["revenue"] >= target).sum()))
      )

      assert targetScenario["monthsPassed"].is_monotonic_decreasing
      targetScenario
    solution: |-
      import pandas as pd
      import matplotlib.pyplot as plt

      reportData = pd.DataFrame({
          "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          "revenue": [82, 91, 105, 112, 121, 130],
          "cost": [55, 58, 62, 64, 68, 72],
          "target": [100, 100, 100, 100, 100, 100],
      })

      def validateChartFrame(frame: pd.DataFrame) -> bool:
          requiredColumns = {"month", "revenue", "cost", "target"}
          missingColumns = requiredColumns - set(frame.columns)
          if missingColumns:
              raise ValueError(f"필수 컬럼 누락: {sorted(missingColumns)}")
          if frame[["revenue", "cost", "target"]].lt(0).any().any():
              raise ValueError("금액 컬럼은 음수가 될 수 없습니다.")
          return True

      validateChartFrame(reportData)
      reportData
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 업무 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 업무 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: matplotlib_00-matplotlib-chart-contract-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - intro
    - workflow_validation
    title: Matplotlib 기본 차트 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 데이터 질문과 축 계약이 일치하는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_matplotlib_chart_contract(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_matplotlib_chart_contract(rows):
            raise NotImplementedError
      solution: |
        def prepare_matplotlib_chart_contract(rows):
            required = ['step', 'value', 'series']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'series'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['step'] for row in usable]
            y_values = [row['value'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.matplotlib.matplotlib_00.matplotlib-chart-contract-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_00.matplotlib-chart-contract-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_matplotlib_chart_contract
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - step: 1
              value: 2
              series: A
            - step: 2
              value: 4
              series: A
            - step: 1
              value: null
              series: B
          expectedReturn:
            usableCount: 2
            excludedCount: 1
            groupCounts:
              A: 2
            xExtent:
            - 1
            - 2
            yExtent:
            - 2
            - 4
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
  - id: matplotlib_00-matplotlib-chart-contract-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - matplotlib_00-matplotlib-chart-contract-data-evidence-mastery
    title: Matplotlib 기본 차트 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 두 실험 series의 단계별 값 변화를 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_matplotlib_chart_contract(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_matplotlib_chart_contract(candidate):
            raise NotImplementedError
      solution: |
        def audit_matplotlib_chart_contract(candidate):
            expected = {'mark': 'line', 'x': 'step', 'y': 'value', 'group': 'series', 'transforms': ['sort-x'], 'interaction': 'none'}
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
      id: python.matplotlib.matplotlib_00.matplotlib-chart-contract-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_00.matplotlib-chart-contract-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_matplotlib_chart_contract
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: line
              x: step
              y: value
              group: series
              transforms:
              - sort-x
              interaction: none
              description: 두 실험 series의 단계별 값 변화를 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: line
              x: step
              y: value
              group: series
              transforms:
              - sort-x
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: value
              y: step
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
            - description
            encoding:
              mark: line
              x: step
              y: value
              group: series
              transforms:
              - sort-x
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: matplotlib_00-matplotlib-chart-contract-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - matplotlib_00-matplotlib-chart-contract-encoding-transfer-transfer
    title: Matplotlib 기본 차트 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 데이터 질문과 축 계약이 일치하는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_matplotlib_chart_contract(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_matplotlib_chart_contract(situation):
            raise NotImplementedError
      solution: |
        def choose_matplotlib_chart_contract(situation):
            table = {'ordered-change': {'encoding': 'line', 'evidence': 'sorted x and visible gaps', 'risk': 'connecting missing values'}, 'category-comparison': {'encoding': 'bar', 'evidence': 'common zero baseline', 'risk': 'using line for unordered labels'}, 'single-value': {'encoding': 'text plus context', 'evidence': 'denominator', 'risk': 'decorative chart'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.matplotlib.matplotlib_00.matplotlib-chart-contract-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.matplotlib.matplotlib_00.matplotlib-chart-contract-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_matplotlib_chart_contract
        cases:
        - id: recalls-ordered-change
          arguments:
          - value: ordered-change
          expectedReturn:
            encoding: line
            evidence: sorted x and visible gaps
            risk: connecting missing values
        - id: recalls-category-comparison
          arguments:
          - value: category-comparison
          expectedReturn:
            encoding: bar
            evidence: common zero baseline
            risk: using line for unordered labels
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};