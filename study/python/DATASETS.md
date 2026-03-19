# Pyodide 호환 데이터셋 레퍼런스

Pyodide 환경에서 사용 가능한 모든 데이터셋을 정리한 문서입니다.

---

## 1. Seaborn 내장 데이터셋

```python
import seaborn as sns
df = sns.load_dataset('데이터셋명')
```

| 데이터셋 | 행 수 | 컬럼 | 도메인 | 적합한 분석 |
|----------|-------|------|--------|-------------|
| tips | 244 | total_bill, tip, sex, smoker, day, time, size | 레스토랑 | 회귀, EDA |
| iris | 150 | sepal_length, sepal_width, petal_length, petal_width, species | 생물학 | 분류, 클러스터링 |
| penguins | 344 | species, island, bill_length_mm, bill_depth_mm, flipper_length_mm, body_mass_g, sex | 생물학 | 분류, EDA |
| titanic | 891 | survived, pclass, sex, age, sibsp, parch, fare, embarked 등 15개 | 역사 | 분류, 생존분석 |
| diamonds | 53,940 | carat, cut, color, clarity, depth, table, price, x, y, z | 상업 | 회귀, 가격예측 |
| mpg | 398 | mpg, cylinders, displacement, horsepower, weight, acceleration, model_year, origin, name | 자동차 | 회귀 |
| flights | 144 | year, month, passengers | 항공 | 시계열, 히트맵 |
| fmri | 1,064 | subject, timepoint, event, region, signal | 뇌과학 | 시계열, ANOVA |
| geyser | 272 | duration, waiting, kind | 자연 | 분포분석, 클러스터링 |
| car_crashes | 51 | total, speeding, alcohol, not_distracted, no_previous, ins_premium, ins_losses, abbrev | 안전 | 상관분석 |
| planets | 1,035 | method, number, orbital_period, mass, distance, year | 천문학 | EDA |
| anscombe | 44 | dataset, x, y | 통계 | 시각화 중요성 |
| attention | 60 | subject, attention, solutions, score | 심리학 | ANOVA |
| dots | 848 | align, choice, time, coherence, firing_rate | 신경과학 | 시계열 |
| exercise | 90 | id, diet, pulse, time, kind | 건강 | ANOVA |
| healthexp | 274 | Year, Country, Spending_USD, Life_Expectancy | 의료 | 시계열, 비교 |
| dowjones | 649 | Date, Price | 금융 | 시계열 |
| taxis | 6,433 | pickup, dropoff, passengers, distance, fare, tip 등 14개 | 교통 | 회귀, 지리 |

---

## 2. Scikit-learn 내장 데이터셋

### Toy Datasets (load_*)

```python
from sklearn.datasets import load_iris
data = load_iris()
X, y = data.data, data.target
```

| 함수 | 행 수 | 특성 수 | 도메인 | 적합한 분석 |
|------|-------|--------|--------|-------------|
| load_iris() | 150 | 4 | 생물학 | 다중 분류 |
| load_digits() | 1,797 | 64 | 이미지 | 이미지 분류 |
| load_wine() | 178 | 13 | 식품 | 다중 분류 |
| load_breast_cancer() | 569 | 30 | 의료 | 이진 분류 |
| load_diabetes() | 442 | 10 | 의료 | 회귀 |
| load_linnerud() | 20 | 3 | 건강 | 다중 출력 회귀 |

### Real World Datasets (fetch_*)

| 함수 | 행 수 | 특성 수 | 도메인 | 적합한 분석 |
|------|-------|--------|--------|-------------|
| fetch_california_housing() | 20,640 | 8 | 부동산 | 회귀 |
| fetch_olivetti_faces() | 400 | 4,096 | 이미지 | 얼굴인식, 차원축소 |
| fetch_20newsgroups() | 18,846 | 텍스트 | 뉴스 | NLP, 문서분류 |

### 합성 데이터 생성 (make_*)

```python
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=1000, n_features=20, n_classes=2)
```

| 함수 | 용도 |
|------|------|
| make_classification() | 분류 알고리즘 테스트 |
| make_regression() | 회귀 알고리즘 테스트 |
| make_blobs() | 클러스터링 |
| make_moons() | 비선형 분류 |
| make_circles() | 비선형 분류 |
| make_swiss_roll() | 매니폴드 학습 |

---

## 3. Statsmodels 내장 데이터셋

```python
import statsmodels.api as sm
data = sm.datasets.sunspots.load_pandas()
df = data.data
```

| 데이터셋 | 설명 | 도메인 | 적합한 분석 |
|----------|------|--------|-------------|
| anes96 | 1996 미국 선거 조사 | 정치 | 로지스틱 회귀 |
| cancer | 유방암 데이터 | 의료 | 생존 분석 |
| co2 | 마우나로아 CO2 | 환경 | 시계열 |
| copper | 세계 구리 시장 1951-1975 | 경제 | 경제 모델링 |
| elnino | 엘니뇨 해수면 온도 | 기후 | 시계열 |
| engel | 엥겔 식품 지출 | 경제 | 분위 회귀 |
| grunfeld | 투자 데이터 1950 | 경제 | 패널 데이터 |
| heart | 이식 생존 데이터 | 의료 | 생존 분석 |
| longley | 경제 데이터 1947-1961 | 경제 | 다중공선성 |
| macrodata | 미국 거시경제 | 경제 | 경제 시계열 |
| nile | 나일강 유량 1871-1970 | 환경 | 시계열 |
| sunspots | 태양 흑점 1700-2008 | 천문학 | 시계열 |

---

## 4. Plotly Express 내장 데이터셋

```python
import plotly.express as px
df = px.data.gapminder()
```

| 데이터셋 | 행 수 | 컬럼 | 도메인 | 적합한 분석 |
|----------|-------|------|--------|-------------|
| gapminder() | 1,704 | country, continent, year, lifeExp, pop, gdpPercap 등 | 경제 | 애니메이션, 지리 |
| tips() | 244 | total_bill, tip, sex, smoker, day, time, size | 레스토랑 | 인터랙티브 |
| iris() | 150 | sepal_length/width, petal_length/width, species | 생물학 | 산점도 |
| wind() | 128 | direction, strength, frequency | 기상 | 극좌표 |
| carshare() | 249 | centroid_lat, centroid_lon, car_hours, peak_hour | 교통 | 지도 |
| election() | 58 | district, Coderre, Bergeron, Joly, total, winner | 정치 | Choropleth |
| stocks() | 100 | date, GOOG, AAPL, AMZN, FB, NFLX, MSFT | 금융 | 라인차트 |
| medals_long() | 9 | nation, medal, count | 스포츠 | 막대차트 |
| experiment() | 100 | experiment_1/2/3, gender, group | 실험 | 박스플롯 |

---

## 5. Vega Datasets

```python
from vega_datasets import data
df = data.cars()
```

| 데이터셋 | 컬럼 | 도메인 | 적합한 분석 |
|----------|------|--------|-------------|
| iris | petalLength/Width, sepalLength/Width, species | 생물학 | 분류 |
| cars | Name, Miles_per_Gallon, Cylinders, Horsepower 등 | 자동차 | 회귀 |
| seattle-weather | date, precipitation, temp_max, temp_min, wind, weather | 기상 | 시계열 |
| stocks | symbol, date, price | 금융 | 시계열 |
| barley | yield, variety, year, site | 농업 | ANOVA |
| airports | iata, name, city, state, country, lat, lon | 지리 | 지도 |
| anscombe | Series, X, Y | 통계 | 시각화 |
| burtin | Bacteria, Penicillin, Streptomycin, Neomycin, Gram_Staining | 의료 | 다중축 |
| driving | year, miles, gas | 에너지 | 연결 산점도 |
| wheat | year, wheat, wages | 역사 | 시계열 |

---

## 6. GitHub Raw URL 데이터셋

### Seaborn Data (mwaskom/seaborn-data)

```python
import pandas as pd
baseUrl = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master"
df = pd.read_csv(f"{baseUrl}/tips.csv")
```

### Plotly Datasets (plotly/datasets)

```python
baseUrl = "https://raw.githubusercontent.com/plotly/datasets/master"
df = pd.read_csv(f"{baseUrl}/gapminder2007.csv")
```

| 파일 | 컬럼 | 도메인 | 적합한 분석 |
|------|------|--------|-------------|
| gapminder2007.csv | country, pop, continent, lifeExp, gdpPercap | 경제 | 비교, 시각화 |
| 2014_world_gdp_with_codes.csv | COUNTRY, GDP (BILLIONS), CODE | 경제 | Choropleth |
| 2014_us_cities.csv | name, pop, lat, lon | 지리 | 버블맵 |
| tesla-stock-price.csv | date, close, volume, open, high, low | 금융 | 캔들스틱 |
| finance-charts-apple.csv | Date, AAPL.Open/High/Low/Close 등 | 금융 | 기술적분석 |
| earthquakes-23k.csv | Date, Latitude, Longitude, Magnitude | 지질학 | 지도, 분포 |

### Jason Brownlee ML Datasets (jbrownlee/Datasets)

```python
baseUrl = "https://raw.githubusercontent.com/jbrownlee/Datasets/master"
df = pd.read_csv(f"{baseUrl}/pima-indians-diabetes.csv", header=None)
```

| 파일 | 행 수 | 도메인 | 적합한 분석 |
|------|-------|--------|-------------|
| iris.csv | 150 | 생물학 | 분류 |
| pima-indians-diabetes.csv | 768 | 의료 | 이진 분류 |
| housing.csv | 506 | 부동산 | 회귀 |
| sonar.csv | 208 | 신호처리 | 이진 분류 |
| ionosphere.csv | 351 | 물리학 | 이진 분류 |
| wine.csv | 178 | 식품 | 다중 분류 |
| abalone.csv | 4,177 | 해양생물 | 회귀 |
| glass.csv | 214 | 법과학 | 다중 분류 |
| breast-cancer-wisconsin.csv | 699 | 의료 | 이진 분류 |
| winequality-red.csv | 1,599 | 식품 | 회귀/분류 |
| monthly-airline-passengers.csv | 144 | 항공 | 시계열 |
| daily-min-temperatures.csv | 3,653 | 기후 | 시계열 |
| shampoo-sales.csv | 36 | 상업 | 시계열 |

### FiveThirtyEight Data (fivethirtyeight/data)

```python
baseUrl = "https://raw.githubusercontent.com/fivethirtyeight/data/master"
df = pd.read_csv(f"{baseUrl}/alcohol-consumption/drinks.csv")
```

| 경로 | 행 수 | 도메인 | 적합한 분석 |
|------|-------|--------|-------------|
| airline-safety/airline-safety.csv | 56 | 항공안전 | 비교 |
| bad-drivers/bad-drivers.csv | 51 | 교통안전 | 상관분석 |
| college-majors/recent-grads.csv | 173 | 교육 | 비교, 회귀 |
| bob-ross/elements-by-episode.csv | 403 | 엔터테인먼트 | 패턴분석 |
| alcohol-consumption/drinks.csv | 193 | 라이프스타일 | 비교, 클러스터링 |
| candy-power-ranking/candy-data.csv | 85 | 식품 | 회귀, 특성분석 |
| hate-crimes/hate_crimes.csv | 51 | 사회 | 회귀, 상관 |
| star-wars-survey/StarWars.csv | 1,186 | 엔터테인먼트 | 설문분석 |
| births/US_births_1994-2003_CDC_NCHS.csv | 3,652 | 인구통계 | 시계열, 계절성 |

### R Datasets CSV (vincentarelbundock/Rdatasets)

```python
baseUrl = "https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv"
df = pd.read_csv(f"{baseUrl}/datasets/mtcars.csv")
```

| 경로 | 행 수 | 도메인 | 적합한 분석 |
|------|-------|--------|-------------|
| datasets/mtcars.csv | 32 | 자동차 | 회귀, 클러스터링 |
| datasets/airquality.csv | 153 | 환경 | 결측값 처리, 회귀 |
| ggplot2/economics.csv | 574 | 경제 | 시계열 |
| MASS/Boston.csv | 506 | 부동산 | 회귀 |

### Frictionless Data (datasets/)

```python
baseUrl = "https://raw.githubusercontent.com/datasets"
df = pd.read_csv(f"{baseUrl}/covid-19/main/data/countries-aggregated.csv")
```

| 저장소/경로 | 도메인 | 적합한 분석 |
|-------------|--------|-------------|
| covid-19/main/data/countries-aggregated.csv | 전염병 | 시계열 |
| s-and-p-500-companies/main/data/constituents.csv | 금융 | 범주형 |
| oil-prices/main/data/wti-daily.csv | 에너지 | 시계열 |
| natural-gas/main/data/daily.csv | 에너지 | 시계열 |

---

## 7. CORGIS Datasets

```python
baseUrl = "https://corgis-edu.github.io/corgis/datasets/csv"
df = pd.read_csv(f"{baseUrl}/airlines/airlines.csv")
```

| 데이터셋 | 도메인 | 적합한 분석 |
|----------|--------|-------------|
| airlines | 항공 | 시계열 |
| astronauts | 우주 | EDA |
| billionaires | 경제 | 시각화 |
| broadway | 엔터테인먼트 | 비즈니스 |
| cancer | 의료 | 통계 |
| classics | 문학 | NLP |
| earthquakes | 지질학 | 지도 |
| energy | 에너지 | 시계열 |
| food | 영양 | 분석 |
| graduates | 교육 | 커리어 |
| hospitals | 의료 | 비용분석 |
| music | 음악 | 추천시스템 |
| real_estate | 부동산 | 가격예측 |
| video_games | 게임 | 산업분석 |
| weather | 기상 | 시계열 |

---

## 8. 신규/고유 데이터셋 (기존 미사용)

다른 카테고리와 중복되지 않는 데이터셋:

### 스포츠/게임

| 데이터셋 | URL | 행 수 | 적합한 분석 |
|----------|-----|-------|-------------|
| Pokemon | `https://raw.githubusercontent.com/lgreski/pokemonData/master/Pokemon.csv` | 1,025 | 통계, 비교 |
| FIFA Players | `https://raw.githubusercontent.com/rashida048/Datasets/master/fifa.csv` | 18,000+ | 클러스터링 |
| NBA Players | TidyTuesday | 4,000+ | 스포츠 분석 |

### 음악/엔터테인먼트

| 데이터셋 | URL | 행 수 | 적합한 분석 |
|----------|-----|-------|-------------|
| Spotify Songs | `https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2020/2020-01-21/spotify_songs.csv` | 32,000 | 정규화, 클러스터링 |

### 과학/환경

| 데이터셋 | URL | 행 수 | 적합한 분석 |
|----------|-----|-------|-------------|
| Earthquakes | `https://raw.githubusercontent.com/plotly/datasets/master/earthquakes-23k.csv` | 23,000 | 지리, 분포 |
| Global Temperature | `https://raw.githubusercontent.com/datasets/global-temp/master/data/monthly.csv` | 4,200 | 시계열, 트렌드 |
| Air Quality | Rdatasets/datasets/airquality.csv | 153 | 결측값, 회귀 |

### 건강/의료

| 데이터셋 | URL | 행 수 | 적합한 분석 |
|----------|-----|-------|-------------|
| Heart Disease | `https://raw.githubusercontent.com/sharmaroshan/Heart-UCI-Dataset/master/heart.csv` | 303 | 분류 |
| Pima Diabetes | jbrownlee/pima-indians-diabetes.csv | 768 | 분류 |
| Weight-Height | `https://raw.githubusercontent.com/chandanverma07/DataSets/master/weight-height.csv` | 10,000 | 회귀, BMI |

### 경제/사회

| 데이터셋 | URL | 행 수 | 적합한 분석 |
|----------|-----|-------|-------------|
| World Happiness | `https://raw.githubusercontent.com/Escavine/World-Happiness/main/World-happiness-report-2024.csv` | 143 | 순위, 상관 |
| California Housing | `https://raw.githubusercontent.com/ageron/handson-ml2/master/datasets/housing/housing.csv` | 20,640 | 회귀 |

### 해양/자연

| 데이터셋 | URL | 행 수 | 적합한 분석 |
|----------|-----|-------|-------------|
| Abalone | jbrownlee/abalone.csv | 4,177 | 회귀 |
| Old Faithful Geyser | seaborn/geyser | 272 | 클러스터링 |

---

## 도메인별 추천

| 도메인 | 추천 데이터셋 | 소스 |
|--------|--------------|------|
| 분류 입문 | iris, penguins | seaborn |
| 회귀 입문 | tips, mpg | seaborn |
| 시계열 | flights, sunspots | seaborn, statsmodels |
| 지리/지도 | gapminder, earthquakes | plotly |
| 금융 | stocks, tesla-stock-price | plotly |
| 의료 | heart, diabetes | jbrownlee |
| 게임 | pokemon | GitHub |
| 음악 | spotify_songs | TidyTuesday |
| 환경 | airquality, global-temp | Rdatasets, datasets |
| 스포츠 | fifa, nba | GitHub |

---

## 카테고리별 사용 현황

| 카테고리 | 사용중인 데이터셋 |
|----------|------------------|
| seaborn | iris, tips, penguins, titanic, flights, diamonds, mpg, exercise, titanic |
| matplotlib | 주가 데이터 (야후), gapminder |
| plotly | gapminder, stocks |
| altair | vega_datasets (cars, seattle-weather 등) |
| statsmodels | advertising, 자체 데이터셋 |
| pandas | 다양한 GitHub CSV |
| polars | 다양한 GitHub CSV |
| duckdb | 다양한 GitHub CSV |

---

## 사용 가이드

### 1. 라이브러리 내장 데이터 (권장)

```python
import seaborn as sns
df = sns.load_dataset('tips')

from sklearn.datasets import load_iris
data = load_iris()

import plotly.express as px
df = px.data.gapminder()
```

### 2. GitHub Raw URL

```python
import pandas as pd
url = "https://raw.githubusercontent.com/저장소/경로/파일.csv"
df = pd.read_csv(url)
```

### 3. 데이터 선택 기준

1. **Pyodide 호환성**: 네트워크 fetch 가능
2. **크기**: 100~50,000행 권장
3. **도메인 다양성**: 기존 카테고리와 중복 최소화
4. **학습 적합성**: 해당 개념을 가르치기에 적절한 구조
