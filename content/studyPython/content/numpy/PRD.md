# NumPy 커리큘럼 PRD

## NumPy 핵심 장점

### 1. 고성능 수치 연산
- C로 구현된 빠른 배열 연산
- 벡터화(Vectorization)로 반복문 없이 연산
- 메모리 효율적인 연속 배열 구조

### 2. 데이터 과학의 기반
- Pandas, Scikit-learn, TensorFlow의 기반
- 다차원 배열(ndarray) 핵심 자료구조
- 과학 계산의 표준 라이브러리

### 3. 브로드캐스팅
- 크기가 다른 배열 간 연산 자동 처리
- 명시적 반복 없이 효율적 연산
- 코드 간결성과 성능 동시 확보

### 4. Pyodide 완벽 호환
- Pyodide 내장 패키지
- 브라우저에서 바로 실행

---

## 데이터셋 (기존 카테고리와 중복 없음)

### 주요 데이터셋

```python
import pandas as pd
import numpy as np

baseUrl = "https://raw.githubusercontent.com"

pokemon = pd.read_csv(f"{baseUrl}/lgreski/pokemonData/master/Pokemon.csv")

spotify = pd.read_csv(f"{baseUrl}/rfordatascience/tidytuesday/main/data/2020/2020-01-21/spotify_songs.csv")

earthquakes = pd.read_csv(f"{baseUrl}/plotly/datasets/master/earthquakes-23k.csv")

heart = pd.read_csv(f"{baseUrl}/sharmaroshan/Heart-UCI-Dataset/master/heart.csv")

temperature = pd.read_csv(f"{baseUrl}/datasets/global-temp/master/data/monthly.csv")

airquality = pd.read_csv(f"{baseUrl}/vincentarelbundock/Rdatasets/master/csv/datasets/airquality.csv")

weightHeight = pd.read_csv(f"{baseUrl}/chandanverma07/DataSets/master/weight-height.csv")

happiness = pd.read_csv(f"{baseUrl}/datasets/world-happiness-report/main/data/WHR_2023.csv")

abalone = pd.read_csv(f"{baseUrl}/jbrownlee/Datasets/master/abalone.csv", header=None)

diabetes = pd.read_csv(f"{baseUrl}/jbrownlee/Datasets/master/pima-indians-diabetes.csv", header=None)
```

### Scikit-learn 합성 데이터

```python
from sklearn.datasets import make_blobs, make_moons, make_classification, make_regression

X, y = make_blobs(n_samples=300, centers=3, random_state=42)
X, y = make_moons(n_samples=200, noise=0.1, random_state=42)
X, y = make_classification(n_samples=500, n_features=10, random_state=42)
X, y = make_regression(n_samples=100, n_features=1, noise=10, random_state=42)
```

---

## 커버할 개념 목록

### A. 배열 생성

| ID | 개념 | 함수/메서드 |
|----|------|-------------|
| A1 | 리스트에서 배열 생성 | np.array() |
| A2 | 0으로 채운 배열 | np.zeros() |
| A3 | 1로 채운 배열 | np.ones() |
| A4 | 빈 배열 | np.empty() |
| A5 | 연속 숫자 배열 | np.arange() |
| A6 | 등간격 배열 | np.linspace() |
| A7 | 단위 행렬 | np.eye(), np.identity() |
| A8 | 랜덤 배열 | np.random.rand(), randn(), randint() |
| A9 | 특정 값으로 채움 | np.full() |

### B. 배열 속성

| ID | 개념 | 속성 |
|----|------|------|
| B1 | 배열 형태 | .shape |
| B2 | 배열 차원 | .ndim |
| B3 | 요소 개수 | .size |
| B4 | 데이터 타입 | .dtype |
| B5 | 요소 크기 | .itemsize |
| B6 | 전체 바이트 | .nbytes |

### C. 인덱싱/슬라이싱

| ID | 개념 | 문법 |
|----|------|------|
| C1 | 기본 인덱싱 | arr[i], arr[i, j] |
| C2 | 슬라이싱 | arr[start:end:step] |
| C3 | 불리언 인덱싱 | arr[arr > 0] |
| C4 | 팬시 인덱싱 | arr[[0, 2, 4]] |
| C5 | 다차원 슬라이싱 | arr[:, 1:3] |

### D. 배열 변형

| ID | 개념 | 함수/메서드 |
|----|------|-------------|
| D1 | 형태 변경 | .reshape() |
| D2 | 평탄화 | .flatten(), .ravel() |
| D3 | 전치 | .T, .transpose() |
| D4 | 차원 추가 | np.newaxis, np.expand_dims() |
| D5 | 차원 제거 | np.squeeze() |
| D6 | 배열 결합 | np.concatenate(), np.vstack(), np.hstack() |
| D7 | 배열 분할 | np.split(), np.vsplit(), np.hsplit() |

### E. 수학 연산

| ID | 개념 | 함수 |
|----|------|------|
| E1 | 산술 연산 | +, -, *, /, //, %, ** |
| E2 | 유니버설 함수 | np.sqrt(), np.exp(), np.log() |
| E3 | 삼각 함수 | np.sin(), np.cos(), np.tan() |
| E4 | 반올림 | np.round(), np.floor(), np.ceil() |
| E5 | 절대값 | np.abs() |
| E6 | 제곱/제곱근 | np.square(), np.sqrt() |
| E7 | 지수/로그 | np.exp(), np.log(), np.log10() |

### F. 통계 함수

| ID | 개념 | 함수 |
|----|------|------|
| F1 | 합계 | np.sum() |
| F2 | 평균 | np.mean() |
| F3 | 중앙값 | np.median() |
| F4 | 표준편차/분산 | np.std(), np.var() |
| F5 | 최대/최소 | np.max(), np.min() |
| F6 | 최대/최소 인덱스 | np.argmax(), np.argmin() |
| F7 | 백분위수 | np.percentile(), np.quantile() |
| F8 | 누적합/누적곱 | np.cumsum(), np.cumprod() |
| F9 | 상관계수 | np.corrcoef() |
| F10 | 공분산 | np.cov() |

### G. 비교/논리 연산

| ID | 개념 | 함수 |
|----|------|------|
| G1 | 비교 연산 | ==, !=, <, >, <=, >= |
| G2 | 논리 연산 | np.logical_and(), np.logical_or(), np.logical_not() |
| G3 | 조건 검사 | np.any(), np.all() |
| G4 | 조건 선택 | np.where() |
| G5 | 고유값 | np.unique() |
| G6 | 정렬 | np.sort(), np.argsort() |
| G7 | 검색 | np.searchsorted() |

### H. 브로드캐스팅

| ID | 개념 | 설명 |
|----|------|------|
| H1 | 스칼라 브로드캐스팅 | 배열 + 스칼라 |
| H2 | 1D-2D 브로드캐스팅 | 행/열 자동 확장 |
| H3 | 일반 브로드캐스팅 규칙 | 차원 호환성 |

### I. 선형대수

| ID | 개념 | 함수 |
|----|------|------|
| I1 | 행렬 곱 | np.dot(), @ 연산자 |
| I2 | 행렬식 | np.linalg.det() |
| I3 | 역행렬 | np.linalg.inv() |
| I4 | 고유값/고유벡터 | np.linalg.eig() |
| I5 | 노름 | np.linalg.norm() |
| I6 | 선형방정식 풀이 | np.linalg.solve() |

### J. 결측값 처리

| ID | 개념 | 함수 |
|----|------|------|
| J1 | NaN 생성 | np.nan |
| J2 | NaN 검사 | np.isnan() |
| J3 | NaN 무시 통계 | np.nanmean(), np.nansum(), np.nanstd() |
| J4 | 무한대 검사 | np.isinf(), np.isfinite() |

### K. 파일 입출력

| ID | 개념 | 함수 |
|----|------|------|
| K1 | 바이너리 저장/로드 | np.save(), np.load() |
| K2 | 다중 배열 저장 | np.savez() |
| K3 | 텍스트 저장/로드 | np.savetxt(), np.loadtxt() |

---

## 10개 프로젝트 정의

### P01. 포켓몬 스탯 분석 (입문)
**결과물**: 포켓몬 능력치 통계 분석
**데이터**: Pokemon.csv (GitHub)
**개념**: A1(array), B1(shape), B4(dtype), F1(sum), F2(mean), F5(max/min)

### P02. 기온 데이터 탐색 (입문)
**결과물**: 월별 기온 변화 분석
**데이터**: global-temp (GitHub)
**개념**: A5(arange), A6(linspace), C1(인덱싱), C2(슬라이싱), F2(mean), F4(std)

### P03. 지진 발생 패턴 (기초)
**결과물**: 지진 규모 분포 및 위치 분석
**데이터**: earthquakes-23k.csv (Plotly)
**개념**: C3(불리언 인덱싱), F6(argmax), F7(percentile), G4(where), G5(unique)

### P04. 음악 특성 분석 (기초)
**결과물**: Spotify 음악 특성 정규화 및 상관분석
**데이터**: spotify_songs.csv (TidyTuesday)
**개념**: D1(reshape), E1(산술연산), F9(corrcoef), H1(브로드캐스팅), J3(nanmean)

### P05. BMI 계산기 (기초)
**결과물**: 키/몸무게로 BMI 계산 및 분류
**데이터**: weight-height.csv (GitHub)
**개념**: E1(연산), G1(비교), G4(where), H1(브로드캐스팅), C3(불리언 인덱싱)

### P06. 심장병 위험 분석 (중급)
**결과물**: 심장병 위험 요인 통계 분석
**데이터**: heart.csv (GitHub)
**개념**: D6(concatenate), F8(cumsum), G3(any/all), G6(sort/argsort), J1(nan)

### P07. 대기질 시계열 (중급)
**결과물**: 대기질 데이터 결측값 처리 및 추세 분석
**데이터**: airquality.csv (Rdatasets)
**개념**: J1-J4(결측값), F8(cumsum), D2(flatten), G4(where), A2(zeros)

### P08. 행복지수 국가 비교 (중급)
**결과물**: 국가별 행복지수 순위 및 요인 분석
**데이터**: world-happiness (GitHub)
**개념**: G6(sort/argsort), F7(percentile), F9(corrcoef), D3(전치), I1(dot)

### P09. 전복 나이 예측 (심화)
**결과물**: 전복 물리적 특성으로 나이 예측 (선형대수 기반)
**데이터**: abalone.csv (jbrownlee)
**개념**: I1-I6(선형대수), D6(vstack), E2(ufunc), F10(cov), H2(브로드캐스팅)

### P10. 당뇨병 종합 분석 (심화)
**결과물**: 당뇨병 예측을 위한 완전한 데이터 분석 파이프라인
**데이터**: pima-indians-diabetes.csv (jbrownlee)
**개념**: 모든 개념 종합, 특히 정규화, 통계, 선형대수, 결측값 처리

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 array          |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| A2 zeros          |     |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
| A5 arange         |     |  ✓  |     |  ✓  |     |  ✓  |     |  ✓  |     |  ✓  |
| A6 linspace       |     |  ✓  |     |     |     |     |     |     |  ✓  |  ✓  |
| A8 random         |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| B1 shape          |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| B4 dtype          |  ✓  |  ✓  |     |  ✓  |     |     |  ✓  |     |  ✓  |  ✓  |
| C1 인덱싱          |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| C2 슬라이싱        |     |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| C3 불리언인덱싱    |     |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| D1 reshape        |     |     |     |  ✓  |     |  ✓  |     |  ✓  |  ✓  |  ✓  |
| D2 flatten        |     |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
| D3 전치           |     |     |     |     |     |     |     |  ✓  |  ✓  |  ✓  |
| D6 concatenate    |     |     |     |     |     |  ✓  |     |     |  ✓  |  ✓  |
| E1 산술연산       |     |     |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| E2 ufunc          |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F1 sum            |  ✓  |     |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| F2 mean           |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| F4 std            |     |  ✓  |     |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| F5 max/min        |  ✓  |     |  ✓  |     |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| F6 argmax/argmin  |     |     |  ✓  |     |     |  ✓  |     |  ✓  |  ✓  |  ✓  |
| F7 percentile     |     |     |  ✓  |     |     |     |     |  ✓  |     |  ✓  |
| F8 cumsum         |     |     |     |     |     |  ✓  |  ✓  |     |     |  ✓  |
| F9 corrcoef       |     |     |     |  ✓  |     |     |     |  ✓  |  ✓  |  ✓  |
| F10 cov           |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| G1 비교연산       |     |     |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| G3 any/all        |     |     |     |     |     |  ✓  |  ✓  |     |     |  ✓  |
| G4 where          |     |     |  ✓  |     |  ✓  |     |  ✓  |     |  ✓  |  ✓  |
| G5 unique         |     |     |  ✓  |     |     |  ✓  |     |  ✓  |     |  ✓  |
| G6 sort/argsort   |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |  ✓  |
| H1 브로드캐스팅   |     |     |     |  ✓  |  ✓  |     |     |  ✓  |  ✓  |  ✓  |
| H2 2D브로드캐스팅 |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| I1 dot/@          |     |     |     |     |     |     |     |  ✓  |  ✓  |  ✓  |
| I2-I6 선형대수    |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| J1-J4 결측값      |     |     |     |  ✓  |     |     |  ✓  |     |     |  ✓  |
```

**커버리지 확인**: 모든 핵심 개념이 최소 2회 이상 등장

---

## 파일 목록

```
numpy/
├── PRD.md
├── 00_NumPy소개.yaml
├── 01_포켓몬스탯분석.yaml
├── 02_기온데이터탐색.yaml
├── 03_지진발생패턴.yaml
├── 04_음악특성분석.yaml
├── 05_BMI계산기.yaml
├── 06_심장병위험분석.yaml
├── 07_대기질시계열.yaml
├── 08_행복지수국가비교.yaml
├── 09_전복나이예측.yaml
└── 10_당뇨병종합분석.yaml
```

---

## Pandas와의 관계

### NumPy 먼저 배우는 이유
| 상황 | NumPy | Pandas |
|------|-------|--------|
| 순수 수치 연산 | O (빠름) | △ (오버헤드) |
| 벡터화 연산 이해 | O (핵심) | O (NumPy 기반) |
| 브로드캐스팅 | O (핵심) | O (NumPy 기반) |
| 라벨 기반 접근 | X | O |
| 다양한 데이터 타입 | △ | O |
| 결측값 처리 | △ (nan) | O (fillna 등) |

### 학습 순서
1. **NumPy 먼저** - 배열 연산, 브로드캐스팅 이해
2. **Pandas로 확장** - DataFrame, 인덱싱, 그룹화
3. **필요시 NumPy 결합** - 성능 최적화, 수치 계산

---

## Agent 협업 규칙

### 1. 파일 작성 순서
```
1. PRD.md 검토 및 확정
2. 00_소개.yaml 작성 (코드 블록 없음)
3. 01~10 프로젝트 순차 작성
```

### 2. 프로젝트 파일 작성 시 체크리스트
- [ ] 이전 프로젝트 개념 반복 사용
- [ ] 새로운 개념 tip 제공 (코드 직후)
- [ ] 변수명 카멜케이스
- [ ] print() 사용 금지
- [ ] 주석 사용 금지
- [ ] marimo 변수 재할당 주의 (각 셀마다 다른 변수명)
- [ ] 실습 섹션 2개 미션 (독립적, import 포함)

### 3. 개념 첫 등장 시
```yaml
- type: code
  content: |-
    import numpy as np
    arr = np.array([1, 2, 3, 4, 5])
    arr

- type: tip
  content: np.array()는 파이썬 리스트를 NumPy 배열로 변환합니다. NumPy 배열은 동일한 데이터 타입만 저장하며, 벡터화 연산이 가능해 반복문 없이 빠른 계산을 수행할 수 있습니다.
```

### 4. 데이터 로드 규칙
- 첫 섹션에서만 import 및 데이터 로드
- 이후 섹션은 변수 공유 (marimo 특성)
- GitHub raw URL 사용
- 기존 카테고리와 다른 데이터셋 사용

### 5. 배열 변수 네이밍 규칙
```python
arr = np.array([1, 2, 3])
arrPokemon = pokemon[['HP', 'Attack']].values
arrTemp = temperature['Mean'].values

arrReshaped = arr.reshape(2, 3)
arrFiltered = arr[arr > 0]
arrSorted = np.sort(arr)

mean = np.mean(arr)
stdDev = np.std(arr)
corrMatrix = np.corrcoef(x, y)
```

### 6. 금지 사항
- `**강조**` 마크다운 문법 (text 블록에서)
- print() 함수
- 주석 (#)
- 같은 변수 재할당 (다른 셀에서)
- 기존 카테고리에서 사용한 데이터셋 (iris, tips, penguins, titanic, gapminder, mpg)

---

## 참고 자료

- [NumPy 공식 문서](https://numpy.org/doc/stable/)
- [NumPy User Guide](https://numpy.org/doc/stable/user/index.html)
- [NumPy API Reference](https://numpy.org/doc/stable/reference/index.html)
- [NumPy GitHub](https://github.com/numpy/numpy)
