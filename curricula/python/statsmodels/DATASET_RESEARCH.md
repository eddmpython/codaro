# statsmodels 카테고리 데이터셋 조사 결과

## 1. statsmodels 내장 데이터셋

### 사용 가능한 데이터셋 목록
```python
import statsmodels.api as sm

# 전체 데이터셋
available = [
    'anes96', 'cancer', 'ccard', 'china_smoking', 'co2', 'committee',
    'copper', 'cpunish', 'elnino', 'engel', 'fair', 'fertility',
    'grunfeld', 'heart', 'interest_inflation', 'longley', 'macrodata',
    'modechoice', 'nile', 'randhie', 'scotland', 'spector',
    'stackloss', 'star98', 'statecrime', 'strikes', 'sunspots'
]
```

### 매출/비즈니스 관련 주요 데이터셋

1. **macrodata** - 미국 거시경제 데이터 (1959Q1-2009Q3)
   - 변수: GDP, 소비, 투자, 실질이자율, 인플레이션
   - 용도: 시계열 회귀, 경제 예측

2. **grunfeld** - Grunfeld (1950) 투자 데이터
   - 11개 미국 기업의 투자 데이터
   - 용도: 패널 데이터 회귀, 투자 예측

3. **interest_inflation** - 독일 이자율/인플레이션 (1972-1998)
   - 용도: 시계열 회귀, 경제 지표 관계 분석

4. **engel** - 엥겔의 식품 지출 데이터
   - 소득과 식품 지출의 관계
   - 용도: 선형 회귀

5. **sunspots** - 태양 흑점 데이터 (1700-2008)
   - 연도별 태양 흑점 수
   - 용도: ARIMA, 시계열 예측

6. **co2** - Mauna Loa 주간 대기 CO2 데이터
   - 용도: 시계열 분해, 계절성 분석

7. **longley** - Longley의 경제 회귀 데이터
   - 용도: 다중공선성 문제 분석

## 2. GitHub Raw CSV 데이터셋 (CORS 제약 없음)

### 회귀 분석 (Linear/Multiple Regression)

1. **Advertising (ISLR)**
   - URL: `https://raw.githubusercontent.com/JWarmenhoven/ISLR-python/master/Notebooks/Data/Advertising.csv`
   - 변수: TV, Radio, Newspaper 광고비 → Sales
   - 200개 시장 데이터
   - 용도: 광고비-매출 예측, 단순/다중 선형 회귀

2. **Boston Housing**
   - URL: `https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv`
   - 변수: 범죄율, 방 개수, 세금 등 → 주택 가격
   - 용도: 부동산 가격 예측 회귀

3. **Insurance Cost**
   - Kaggle: medical insurance dataset
   - 변수: age, sex, bmi, children, smoker, region → charges
   - 용도: 의료보험 비용 예측 회귀

### 시계열 예측 (Time Series)

4. **AirPassengers**
   - URL: `https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv`
   - 월별 항공 승객 수 (1949-1960)
   - 용도: ARIMA, 계절성 분해, 수요 예측

5. **Superstore Sales**
   - URL: `https://raw.githubusercontent.com/curran/data/gh-pages/superstoreSales/superstoreSales.csv`
   - 변수: Sales, Profit, Discount, Order Date 등
   - 8,399 거래 데이터
   - 용도: 매출 예측, 수익성 분석

6. **Bike Sharing Demand**
   - UCI ML Repository (GitHub 호스팅)
   - 시간별/일별 자전거 대여 수 (2011-2012)
   - 변수: 날씨, 계절, 시간 → 대여 수요
   - 용도: 수요 예측 시계열

7. **Walmart Sales**
   - Kaggle 데이터 (GitHub 재호스팅)
   - 45개 매장의 주간 매출
   - 변수: Weekly_Sales, Temperature, Fuel_Price, CPI, Unemployment
   - 용도: 소매 매출 예측, ARIMA/SARIMA

8. **Energy Consumption**
   - Our World in Data: `https://github.com/owid/energy-data`
   - 국가별 에너지 소비 데이터
   - 용도: 전력 수요 예측

### 로지스틱 회귀 (Logistic Regression)

9. **E-commerce Customer Churn**
   - GitHub: 다수의 e-commerce churn 데이터셋
   - 변수: 고객 행동 → 이탈 여부 (0/1)
   - 용도: 고객 이탈 예측, 로지스틱 회귀

10. **Employee Attrition (IBM HR)**
    - GitHub: WA_Fn-UseC_-HR-Employee-Attrition.csv
    - 변수: 근무년수, 거리, 급여 만족도 → 퇴사 여부
    - 용도: 직원 이탈 예측, 로지스틱 회귀

### 기타 회귀 분석

11. **CO2 Emissions & Temperature**
    - Our World in Data: `https://github.com/owid/co2-data`
    - 변수: CO2 배출량 → 지구 온도
    - 용도: 환경 영향 분석, 회귀

12. **Economic Indicators**
    - URL: `https://github.com/danieleongari/investing_economic_indicators`
    - 2,133개 경제 지표 (GDP, 실업률, CPI)
    - 용도: 경제 지표 관계 분석, 회귀

## 3. 기존 카테고리 중복 체크

### 중복 제외 데이터셋
- titanic (pandas, duckdb 사용)
- tips (pandas, duckdb, plotly 사용)
- iris (pandas, plotly, altair 사용)
- gapminder (pandas, plotly, altair 사용)
- mpg (pandas 사용)
- stocks (polars, plotly, altair 사용)
- movies (altair 사용)
- weather (polars, altair 사용)
- flights (pandas 사용)

## 4. 10개 프로젝트 추천 조합

### 회귀 분석 프로젝트 (4개)

1. **광고비-매출 예측 (Advertising)**
   - 데이터: ISLR Advertising.csv
   - 분석: 단순/다중 선형 회귀
   - 목표: TV/Radio/Newspaper 광고비로 매출 예측
   - 비즈니스 가치: 광고 ROI 최적화

2. **부동산 가격 예측 (Boston Housing)**
   - 데이터: Boston Housing
   - 분석: 다중 회귀, 특성 선택
   - 목표: 주택 특성으로 가격 예측
   - 비즈니스 가치: 부동산 가격 책정

3. **의료보험 비용 예측 (Insurance)**
   - 데이터: Medical Insurance Cost
   - 분석: 다중 회귀, 로그 변환
   - 목표: 개인 특성으로 보험료 예측
   - 비즈니스 가치: 보험 상품 가격 책정

4. **경제 지표 관계 분석 (Macrodata)**
   - 데이터: statsmodels.macrodata
   - 분석: 시계열 회귀, VAR
   - 목표: GDP, 인플레이션, 이자율 관계
   - 비즈니스 가치: 경제 예측

### 시계열 예측 프로젝트 (4개)

5. **항공 수요 예측 (AirPassengers)**
   - 데이터: AirPassengers
   - 분석: ARIMA, SARIMA, 계절성 분해
   - 목표: 월별 승객 수 예측
   - 비즈니스 가치: 항공사 용량 계획

6. **소매 매출 예측 (Superstore)**
   - 데이터: Superstore Sales
   - 분석: 시계열 회귀, 계절성
   - 목표: 제품 카테고리별 매출/수익 예측
   - 비즈니스 가치: 재고 관리, 수익 최적화

7. **월마트 수요 예측 (Walmart)**
   - 데이터: Walmart Weekly Sales
   - 분석: SARIMA, 외생변수 포함
   - 목표: 경제 지표로 주간 매출 예측
   - 비즈니스 가치: 수요 예측, 인력 계획

8. **자전거 공유 수요 예측 (Bike Sharing)**
   - 데이터: Bike Sharing Dataset
   - 분석: 시계열 회귀, 요일/시간 패턴
   - 목표: 날씨/시간으로 대여 수요 예측
   - 비즈니스 가치: 자전거 배치 최적화

### 로지스틱 회귀 프로젝트 (2개)

9. **고객 이탈 예측 (E-commerce Churn)**
   - 데이터: E-commerce Churn
   - 분석: 로지스틱 회귀, ROC-AUC
   - 목표: 구매 패턴으로 이탈 예측
   - 비즈니스 가치: 고객 유지 전략

10. **직원 퇴사 예측 (Employee Attrition)**
    - 데이터: IBM HR Attrition
    - 분석: 로지스틱 회귀, 특성 중요도
    - 목표: HR 지표로 퇴사 확률 예측
    - 비즈니스 가치: 인재 유지, 채용 계획

## 5. pyodide 환경 확인사항

### statsmodels 내장 데이터
- ✅ 패키지 내부에 포함, CORS 문제 없음
- ✅ `sm.datasets.load()` 직접 사용 가능

### GitHub Raw URLs
- ✅ raw.githubusercontent.com은 CORS 허용
- ✅ `pd.read_csv(url)` 직접 사용 가능

### Our World in Data
- ✅ GitHub 저장소, raw URL 사용 가능
- ✅ 대용량 데이터는 필터링 필요

### Kaggle Datasets
- ❌ 직접 다운로드 불가 (API 인증 필요)
- ✅ GitHub에 재호스팅된 버전 사용

## 6. 실용성 평가

### 높은 비즈니스 가치
1. 광고비-매출 예측 → 마케팅 ROI
2. 소매 매출 예측 → 재고/수익 관리
3. 고객 이탈 예측 → 고객 유지
4. 수요 예측 → 용량/인력 계획
5. 직원 퇴사 예측 → 인재 관리

### 학습 가치
1. ARIMA/SARIMA 시계열 모델링
2. 로지스틱 회귀 분류
3. 다중 회귀 특성 선택
4. 계절성 분해
5. 진단 및 검정

## 7. 최종 권장사항

### 코어 데이터셋 (반드시 포함)
1. Advertising (회귀 기초)
2. AirPassengers (시계열 기초)
3. Superstore Sales (종합 비즈니스 분석)
4. E-commerce Churn (로지스틱 회귀)

### 추가 데이터셋 (프로젝트 다양성)
5. Boston Housing (회귀 심화)
6. Walmart Sales (SARIMA)
7. Bike Sharing (수요 예측)
8. Employee Attrition (HR 분석)
9. Insurance Cost (가격 책정)
10. Macrodata (경제 지표)

모든 데이터셋은 pyodide 환경에서 CORS 제약 없이 사용 가능하며, statsmodels의 회귀/시계열 기능을 충분히 활용할 수 있습니다.
