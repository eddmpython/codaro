# statsmodels 카테고리 PRD

## 라이브러리 소개

**statsmodels**: Python 통계 분석의 표준 라이브러리

### 왜 statsmodels인가?

1. **통계 분석 특화**: 회귀분석, 시계열, 가설검정 등 통계 분석에 최적화
2. **R 수준의 통계**: R 통계 패키지와 동등한 수준의 분석 가능
3. **검정력 있는 결과**: p-value, 신뢰구간, 잔차분석 등 통계적 근거 제공
4. **비즈니스 활용**: 매출 예측, A/B 테스트, 수요 예측 등 실무 적용
5. **학술 연구**: 논문 작성에 필요한 통계 모델 제공

### 다른 라이브러리와의 차이

- **pandas**: 데이터 전처리 → **statsmodels**: 통계 분석
- **scikit-learn**: 머신러닝 예측 → **statsmodels**: 통계적 추론
- **scipy.stats**: 기본 통계 → **statsmodels**: 고급 회귀/시계열

---

## 대상 데이터셋 (다른 카테고리 미사용 + CORS 제약 없음)

| 번호 | 데이터셋 | 출처 | 용도 | 비즈니스 가치 |
|------|----------|------|------|--------------|
| 01 | 광고비-매출 | GitHub ISLR Advertising.csv | 단순/다중 회귀 | 마케팅 ROI 최적화 |
| 02 | 부동산 가격 | GitHub Boston Housing.csv | 다중회귀, 특성 선택 | 부동산 가격 책정 |
| 03 | 항공 수요 | GitHub AirPassengers.csv | 시계열 분해, ARIMA | 항공사 용량 계획 |
| 04 | 소매 매출 | GitHub Superstore Sales.csv | 시계열 회귀, 수익 분석 | 재고/수익 관리 |
| 05 | 의료보험 비용 | GitHub Insurance Cost.csv | 다중회귀, 로그 변환 | 보험 상품 가격 책정 |
| 06 | 월마트 매출 | GitHub Walmart Sales.csv | SARIMA, 외생변수 | 소매 수요 예측 |
| 07 | 자전거 공유 | GitHub Bike Sharing.csv | 시계열 회귀, 패턴 분석 | 자전거 배치 최적화 |
| 08 | 고객 이탈 | GitHub E-commerce Churn.csv | 로지스틱 회귀, ROC-AUC | 고객 유지 전략 |
| 09 | 직원 퇴사 | GitHub IBM HR Attrition.csv | 로지스틱 회귀, 특성 중요도 | 인재 유지, 채용 계획 |
| 10 | 경제 지표 | statsmodels.datasets.macrodata | 시계열 VAR, 관계 분석 | 경제 예측 |

**데이터 확인**:
- ✅ 기존 카테고리 미사용 (titanic, tips, iris, gapminder, stocks 등 제외)
- ✅ GitHub raw.githubusercontent.com (CORS 허용)
- ✅ statsmodels 내장 데이터 (패키지 내부 포함)
- ✅ pyodide 환경에서 `pd.read_csv(url)` 직접 사용 가능

---

## 커버할 개념 (A-J)

| 개념 | 이름 | 설명 |
|------|------|------|
| A | 단순선형회귀 | OLS, 기울기, 절편, R² |
| B | 회귀 평가 | summary(), p-value, 신뢰구간 |
| C | 잔차 분석 | resid, 정규성 검정, QQ plot |
| D | 다중회귀 | 여러 독립변수, VIF |
| E | 범주형 변수 | 더미 변수, C() 함수 |
| F | 로지스틱 회귀 | Logit, 확률 예측 |
| G | 시계열 분해 | 추세, 계절성, 잔차 |
| H | ARIMA | AR, MA, 차분 |
| I | 가설 검정 | t-test, ANOVA, chi-square |
| J | 진단 도구 | influence plot, 이상치 탐지 |

---

## 10개 프로젝트 설계

### 01_광고비매출예측 (입문) ⭐
- **데이터**: ISLR Advertising (TV/Radio/Newspaper → Sales)
- **목표**: 광고비로 매출 예측하기
- **개념**: A(OLS 기본), B(summary 해석)
- **결과물**: 회귀식, R², 예측 그래프
- **비즈니스 가치**: 마케팅 ROI 최적화

### 02_부동산가격예측 (입문) ⭐⭐
- **데이터**: Boston Housing (방 개수, 범죄율 등 → 주택 가격)
- **목표**: 주택 특성으로 가격 예측
- **개념**: A(회귀), B(평가), C(잔차분석 기초)
- **결과물**: 잔차 플롯, 예측 vs 실제
- **비즈니스 가치**: 부동산 가격 책정

### 03_매출다중요인분석 (기초) ⭐⭐
- **데이터**: Superstore Sales (날짜, 제품, 지역 → 매출/수익)
- **목표**: 여러 변수로 매출 예측 (다중회귀)
- **개념**: A, B, C, D(다중회귀, VIF)
- **결과물**: 변수 중요도, 다중공선성 체크
- **비즈니스 가치**: 매출 드라이버 파악

### 04_보험료가격책정 (기초) ⭐⭐⭐
- **데이터**: Medical Insurance (나이, BMI, 흡연 → 보험료)
- **목표**: 범주형 변수 포함 회귀 (성별, 지역)
- **개념**: A, B, D, E(더미 변수)
- **결과물**: 집단별 계수, 해석
- **비즈니스 가치**: 보험 상품 가격 책정

### 05_고객이탈예측 (기초) ⭐⭐⭐
- **데이터**: E-commerce Churn (구매 패턴 → 이탈 여부)
- **목표**: 로지스틱 회귀로 이탈 확률 예측
- **개념**: F(Logit), B(평가), C(잔차)
- **결과물**: 확률 예측, ROC 곡선, 혼동 행렬
- **비즈니스 가치**: 고객 유지 전략

### 06_항공수요시계열 (중급) ⭐⭐⭐
- **데이터**: AirPassengers (1949-1960 월별 승객 수)
- **목표**: 시계열 분해로 패턴 파악
- **개념**: G(시계열 분해), A(추세 회귀)
- **결과물**: 추세, 계절성, 잔차 그래프
- **비즈니스 가치**: 항공사 용량 계획

### 07_월마트매출예측 (중급) ⭐⭐⭐⭐
- **데이터**: Walmart Sales (주간 매출 + CPI, 실업률)
- **목표**: 외생변수 포함 시계열 회귀
- **개념**: A, D, G(시계열), 외생변수
- **결과물**: 경제 지표 반영 매출 예측
- **비즈니스 가치**: 소매 수요 예측

### 08_직원퇴사예측 (중급) ⭐⭐⭐⭐
- **데이터**: IBM HR Attrition (근무년수, 급여 → 퇴사 여부)
- **목표**: 로지스틱 회귀 + 가설 검정
- **개념**: I(가설검정), F(로지스틱), B(p-value), E(범주형)
- **결과물**: 퇴사 확률, 특성 중요도, t-검정
- **비즈니스 가치**: 인재 유지, 채용 계획

### 09_자전거수요ARIMA (심화) ⭐⭐⭐⭐
- **데이터**: Bike Sharing (시간별 대여 수 + 날씨)
- **목표**: ARIMA로 시계열 예측
- **개념**: G, H(ARIMA), C(진단)
- **결과물**: ACF, PACF, 예측 구간
- **비즈니스 가치**: 자전거 배치 최적화

### 10_경제지표종합분석 (심화) ⭐⭐⭐⭐⭐
- **데이터**: Macrodata (GDP, 인플레이션, 이자율)
- **목표**: 회귀 + 시계열 + 검정 종합
- **개념**: A-J 모두 활용
- **결과물**: 경제 지표 관계, 예측, 이상치 탐지
- **비즈니스 가치**: 경제 예측, 정책 분석

---

## 개념 분배 매트릭스

| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A 단순선형회귀 | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | | | ✓ |
| B 회귀평가 | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | | ✓ |
| C 잔차분석 | | ✓ | ✓ | | ✓ | | | | ✓ | ✓ |
| D 다중회귀 | | | ✓ | ✓ | | | ✓ | | | ✓ |
| E 범주형변수 | | | | ✓ | | | | ✓ | | ✓ |
| F 로지스틱회귀 | | | | | ✓ | | | | | ✓ |
| G 시계열분해 | | | | | | ✓ | ✓ | | ✓ | ✓ |
| H ARIMA | | | | | | | | | ✓ | ✓ |
| I 가설검정 | | | | | | | | ✓ | | ✓ |
| J 진단도구 | | | | | | | | | | ✓ |

**반복 학습 확인**:
- 모든 개념이 최소 3회 이상 등장
- 초반 개념(A, B)이 후반까지 반복 사용
- 난이도 순차 증가

---

## 파일 구조 예시 (01_광고비매출예측.yaml)

```yaml
meta:
  id: statsmodels_01
  title: 광고비매출예측
  order: 1
  category: statsmodels
  difficulty: "⭐"
  badge: 입문
  dataUrl: https://raw.githubusercontent.com/JWarmenhoven/ISLR-python/master/Notebooks/Data/Advertising.csv
  tags: ["회귀분석", "OLS", "R²", "매출예측", "마케팅ROI"]
  seo:
    title: "statsmodels 회귀분석 - 광고비로 매출 예측하기"
    description: "단순선형회귀로 TV 광고비와 매출의 관계를 분석합니다. OLS, R², p-value를 실습합니다."
    keywords: ["statsmodels", "회귀분석", "OLS", "광고효과", "매출예측"]

intro:
  emoji: "📊"
  goal: 광고비로 매출을 예측하는 회귀 모델 만들기
  description: 단순선형회귀의 기초를 배웁니다. 기울기, 절편, R²를 이해하고, 광고 ROI를 최적화합니다.

sections:
- id: step1_install
  title: 1단계. statsmodels 설치
  subtitle: pyodide 환경에서 라이브러리 설치
  blocks:
  - type: text
    content: statsmodels는 Python 통계 분석의 표준 라이브러리입니다. 회귀분석, 시계열, 가설검정 등 다양한 통계 모델을 제공합니다. pyodide 환경에서는 micropip으로 설치합니다.
  - type: code
    language: python
    title: statsmodels 설치
    description: micropip으로 패키지 설치
    content: |-
      import micropip
      await micropip.install('statsmodels')
  - type: tip
    content: pyodide는 브라우저에서 실행되는 Python 환경입니다. micropip.install()로 필요한 패키지를 설치할 수 있습니다. await 키워드는 비동기 작업이 완료될 때까지 기다립니다.

- id: step2_load
  title: 2단계. 데이터 불러오기
  subtitle: 광고비-매출 데이터셋
  blocks:
  - type: text
    content: ISLR(Introduction to Statistical Learning with R) Advertising 데이터셋을 사용합니다. 200개 시장에서 TV, Radio, Newspaper 광고비와 매출 데이터를 수집했습니다. GitHub raw URL로 직접 불러올 수 있습니다.
  - type: code
    language: python
    title: 데이터 불러오기
    description: GitHub에서 CSV 파일 로드
    content: |-
      import pandas as pd
      import statsmodels.api as sm

      url = "https://raw.githubusercontent.com/JWarmenhoven/ISLR-python/master/Notebooks/Data/Advertising.csv"
      advertising = pd.read_csv(url, index_col=0)
      advertising.shape
  - type: tip
    content: index_col=0은 첫 번째 컬럼을 인덱스로 사용합니다. shape은 (행, 열) 형태로 데이터 크기를 보여줍니다.

- id: step3_explore
  title: 3단계. 데이터 탐색
  subtitle: 변수 확인하기
  blocks:
  - type: text
    content: TV, Radio, Newspaper는 각 매체의 광고비(천 달러), Sales는 매출(천 개)입니다. 어떤 광고 매체가 매출에 가장 큰 영향을 미칠까요?
  - type: code
    language: python
    title: 데이터 미리보기
    description: 상위 5개 행 확인
    content: |-
      advertising.head()

- id: step4_ols
  title: 4단계. 단순선형회귀 (OLS)
  subtitle: TV 광고비로 매출 예측
  blocks:
  - type: text
    content: OLS(Ordinary Least Squares, 최소제곱법)는 회귀선을 찾는 가장 기본적인 방법입니다. TV 광고비로 매출을 예측하는 모델을 만듭니다. statsmodels는 절편(상수항)을 자동으로 추가하지 않으므로 add_constant()를 사용해야 합니다.
  - type: code
    language: python
    title: 단순선형회귀 모델
    description: TV 광고비 → 매출
    content: |-
      X = advertising[['TV']]
      y = advertising['Sales']

      X = sm.add_constant(X)
      modelTV = sm.OLS(y, X).fit()
      modelTV.params
  - type: tip
    content: sm.add_constant(X)는 X에 절편(상수 1) 컬럼을 추가합니다. 회귀식 y = a + bx에서 a(절편)를 추정하기 위해 필요합니다. OLS(y, X).fit()으로 회귀 모델을 학습합니다. params는 절편(const)과 기울기(TV)를 보여줍니다.

- id: step5_summary
  title: 5단계. 모델 평가 (summary)
  subtitle: 통계적 유의성 확인
  blocks:
  - type: text
    content: summary()는 회귀 분석의 모든 통계량을 한 번에 보여줍니다. R²(결정계수), p-value, 신뢰구간 등을 확인할 수 있습니다. 이 정보로 모델이 통계적으로 유의미한지 판단합니다.
  - type: code
    language: python
    title: 모델 요약 통계
    description: R², p-value, 계수 확인
    content: |-
      modelTV.summary()
  - type: tip
    content: R²(R-squared)는 모델의 설명력입니다. 0~1 사이 값으로, 1에 가까울수록 모델이 데이터를 잘 설명합니다. p-value < 0.05면 통계적으로 유의미합니다(귀무가설 기각). coef는 계수(기울기), std err은 표준오차, t는 t-통계량입니다.

- id: step6_predict
  title: 6단계. 매출 예측하기
  ...

- id: practice
  title: 실습
  subtitle: 광고 효과 분석 프로젝트
  blocks:
  - type: text
    content: 마케팅 분석가가 되어 광고 효과를 분석해봅시다.
  - type: expansion
    title: "미션1: Radio 광고비로 매출 예측"
    code: |-
      XRadio = sm.add_constant(advertising[['Radio']])
      modelRadio = sm.OLS(advertising['Sales'], XRadio).fit()
      modelRadio.summary()
  - type: expansion
    title: "미션2: TV와 Radio 중 어느 광고가 더 효과적인가?"
    code: |-
      tvRsquared = modelTV.rsquared
      radioRsquared = modelRadio.rsquared
      pd.DataFrame({'TV': [tvRsquared], 'Radio': [radioRsquared]})
```

---

## 단계별 상세 계획

### 각 프로젝트 공통 구조 (10-15 단계)

1. **데이터 로드**: statsmodels.datasets 또는 URL
2. **탐색**: head(), describe(), 시각화
3. **모델 구축**: OLS, Logit, ARIMA 등
4. **평가**: summary(), R², p-value
5. **잔차 분석**: resid, QQ plot
6. **예측**: predict(), 신뢰구간
7. **시각화**: 회귀선, 잔차 플롯
8. **실습**: 4-5개 미션 (배운 개념 모두 활용)
9. **정리**: 핵심 개념 요약

### 난이도별 특징

- **입문 (01-02)**: 단순회귀, summary 해석, 기본 시각화
- **기초 (03-05)**: 다중회귀, 범주형 변수, 로지스틱
- **중급 (06-08)**: 시계열, 가설검정, 다항회귀
- **심화 (09-10)**: ARIMA, 종합 프로젝트

---

## 실습 섹션 강화 원칙 (매우 중요!)

### 1. 누적 학습 원칙
- **프로젝트 01**: 01에서 배운 개념만 실습
- **프로젝트 02**: 01-02에서 배운 모든 개념 실습
- **프로젝트 03**: 01-03에서 배운 모든 개념 실습
- **프로젝트 N**: 01-N에서 배운 모든 개념 종합 실습

### 2. 실습 미션 구성
**각 프로젝트는 2개 미션으로 구성** (3개 이상 금지):
- **미션1**: 해당 프로젝트 핵심 개념 전체 과정
- **미션2**: 누적 개념 종합 + 비교/분석

### 3. 실습 미션 독립성 원칙 (반드시 준수!)

**핵심**: 각 미션은 **완전히 독립적**으로 실행 가능해야 함

#### import문 포함
- 각 미션 시작에 필요한 모든 import 포함
- tip으로 안내: "위 연습 예제를 실행했다면 import문 제거해도 됨"

#### 데이터 로딩 포함
- 각 미션마다 독립적으로 데이터 로딩
- URL 변수명을 미션별로 다르게: `urlRadio`, `urlCompare`

#### 변수명 고유화
- 연습 예제와 겹치지 않도록
- 미션 간 겹치지 않도록
- 데이터: `dataRadio`, `dataCompare`
- 모델: `modelRadio`, `modelCompare`

#### 전체 과정 포함
- 데이터 로딩 → 전처리 → 모델 학습 → 평가 → 시각화
- 해당 프로젝트에서 배운 개념 최대한 활용

### 4. 실습 text 블록 작성 규칙
**MUST HAVE**: 실습 섹션 시작 부분에 2-3문장 이상의 상세한 설명 필수

```yaml
- id: practice
  title: 실습
  subtitle: [역할] 프로젝트
  blocks:
  - type: text
    content: |-
      [역할]이 되어 실전 분석을 수행합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가,
      시각화까지 전 과정을 독립적으로 수행합니다. 이번 프로젝트에서 배운 [개념A, B, C]와
      이전 프로젝트의 [개념X, Y]를 모두 활용합니다.
  - type: tip
    content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
```

### 5. 답안 코드 작성 규칙
- **여러 줄 허용**: 복잡한 분석은 10-20줄도 가능
- **전처리 포함**: 필요 시 데이터 준비 단계 포함
- **메서드 체이닝**: 가독성 있게 단계별로 작성
- **결과 확인**: 마지막은 결과 출력

---

## 정리 섹션 맥락 유지 원칙 (매우 중요!)

### 1. 정리 섹션 구조
```yaml
- id: summary
  title: 정리
  subtitle: [난이도] 과정 완료!
  blocks:
  - type: text
    content: |-
      이번 프로젝트에서는 [구체적 목표]를 달성했습니다. [데이터명] 데이터로
      [분석 내용]을 수행하며 [배운 개념들]을 익혔습니다. 이제 [실무 활용 예시]를
      할 수 있습니다.
  - type: list
    items:
    - "[개념A] - [간단한 설명]"
    - "[개념B] - [간단한 설명]"
  - type: text
    content: |-
      다음 프로젝트에서는 [다음 프로젝트 주제]를 다룹니다. [다음에 배울 개념]을
      배우며 [이전 개념]과 결합하여 더 복잡한 분석을 수행합니다.
```

### 2. 정리 text 작성 규칙

**첫 번째 text 블록**:
- ✅ "이번 프로젝트에서는..."으로 시작
- ✅ 해당 프로젝트의 구체적 데이터/목표 언급
- ✅ 비즈니스 가치 강조
- ❌ 추상적/일반적 표현 금지
- ❌ 다른 프로젝트 내용 언급 금지

**두 번째 text 블록 (마무리)**:
- ✅ "다음 프로젝트에서는..."으로 자연스럽게 연결
- ✅ 학습 여정의 연속성 강조
- ✅ 난이도 상승 예고
- ❌ 갑작스러운 주제 전환 금지

### 3. 나쁜 예시 vs 좋은 예시

**❌ 나쁜 예시** (맥락 벗어남):
```yaml
- type: text
  content: pandas 중급 과정을 모두 마쳤습니다!
- type: list
  items:
  - "set_index()"
  - "rank()"
- type: text
  content: 다음은 심화 과정입니다. merge를 배웁니다.
```
**문제점**:
- 해당 프로젝트(교통사고) 내용이 없음
- 갑작스럽게 "중급 과정 완료" 선언
- merge가 갑자기 등장 (맥락 단절)

**✅ 좋은 예시** (맥락 유지):
```yaml
- type: text
  content: |-
    이번 프로젝트에서는 미국 51개 주의 교통사고 데이터를 분석하여 "가장 위험한 주"를
    찾아냈습니다. set_index()로 주 약자를 인덱스로 설정하고, rank()로 순위를 매기며,
    정규화로 여러 지표를 0~1 스케일로 맞춘 뒤 종합 위험도 점수를 계산했습니다.
    이제 지역별 비교 분석과 다중 지표 통합 기법을 활용하여 실전 데이터를 평가할 수 있습니다.
- type: list
  items:
  - "set_index() - 의미있는 인덱스로 직관적 조회"
  - "rank() - 값의 순위 매기기"
  - "정규화 - 서로 다른 스케일을 0~1로 통일"
  - "종합 점수 - 여러 지표를 하나로 합쳐 평가"
- type: text
  content: |-
    다음 프로젝트부터는 심화 과정이 시작됩니다. 여러 데이터셋을 결합하는 merge를 배우며,
    지금까지 배운 필터링, 그룹화, 정렬 기법과 함께 사용하여 더욱 복잡한 관계형 데이터
    분석을 수행합니다.
```
**장점**:
- 교통사고 프로젝트의 구체적 내용 언급
- 배운 개념의 실무 활용 명시
- 다음 단계로 자연스럽게 연결

---

## 초보자 배려 원칙 (매우 중요!)

### 1. 문법/개념 설명 필수
사용자는 **Python 문법도 모른다고 가정**:
- `def`, `return`, `lambda`, `[]`, `()` 모두 설명
- `=` vs `==` 차이 설명
- 메서드 체이닝(`.` 연결) 개념 설명
- 인덱싱 `[0]`, 슬라이싱 `[:]` 설명

### 2. tip 블록 활용
**새로운 개념이 처음 등장할 때 반드시 tip 제공**:
```yaml
- type: code
  content: |-
    model = sm.OLS(y, X).fit()
- type: tip
  title: "fit()이 뭔가요?"
  content: |-
    fit()은 "학습하다, 적합시키다"는 뜻입니다. 데이터에 맞는 최적의 회귀선을 찾는
    과정입니다. OLS(y, X)로 모델을 정의하고, .fit()으로 실제 계산을 수행합니다.
    fit() 이후에야 params(계수), summary(통계량) 등을 확인할 수 있습니다.
```

### 3. text 블록 상세화
**최소 2-3문장, 배경-이유-효과 모두 포함**:
```yaml
- type: text
  content: |-
    [배경] 회귀분석에서는 절편(상수항)이 필요합니다.
    [이유] statsmodels는 sklearn과 달리 절편을 자동으로 추가하지 않으므로
    add_constant()를 명시적으로 호출해야 합니다.
    [효과] 절편을 추가하면 y = a + bx 형태의 완전한 회귀식을 만들 수 있습니다.
```

---

## 검토 체크리스트

### 데이터셋 분리 확인
- [x] pandas 미사용 데이터셋
- [x] polars 미사용 데이터셋
- [x] duckdb 미사용 데이터셋
- [x] plotly 미사용 데이터셋
- [x] altair 미사용 데이터셋

### Principles 준수
- [x] 파일 하나 = 프로젝트 하나
- [x] 난이도 순차 증가
- [x] 개념 반복 확장 (최소 3회)
- [x] 10개 프로젝트 전체로 모든 개념 커버
- [x] 초보자 친화적 설명
- [x] 실습 섹션 포함

### 코드 스타일
- [x] print() 금지 (표현식만)
- [x] 주석 금지 (text 블록으로 설명)
- [x] 카멜케이스 변수명
- [x] marimo 변수 재할당 고려

---

## 다음 단계

1. **PRD 승인** 받기
2. **00_statsmodels소개.yaml** 작성 (코드 없는 소개 파일)
3. **01-10 프로젝트 파일** 순차 작성
4. **각 파일마다 YAML 검증** 수행
5. **marimo 변수 재할당 이슈 사전 체크**
