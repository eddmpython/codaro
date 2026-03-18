# scikit-learn 카테고리 PRD

## 라이브러리 소개

**scikit-learn**: Python 머신러닝의 표준 라이브러리

### 왜 scikit-learn인가?

1. **통일된 API**: fit/predict/transform 일관된 인터페이스
2. **완전한 파이프라인**: 전처리 → 학습 → 평가 → 튜닝
3. **다양한 알고리즘**: 분류, 회귀, 클러스터링, 차원축소
4. **실무 표준**: 산업계와 학계 모두에서 가장 널리 사용
5. **Pyodide 지원**: 브라우저 환경에서 완전 동작

### statsmodels와의 차이 (학습 순서 이유)

- **statsmodels (선수 과목)**: "왜" 이 변수가 유의미한지 해석 (p-value, 신뢰구간, 계수 해석)
- **scikit-learn (본 과목)**: "얼마나" 잘 예측하는지 평가 (정확도, F1, MSE)

통계적 이해 → 머신러닝 예측 순서로 학습

---

## Pyodide 환경 고려사항

```python
import micropip
await micropip.install('scikit-learn')
```

**제한사항**:
- `n_jobs=-1` 병렬처리 불가 (WebAssembly 제한)
- 초기 로딩 약 10-20MB
- 일부 희귀 모듈 미지원

**정상 동작 확인된 기능**:
- LinearRegression, LogisticRegression, Ridge, Lasso
- RandomForestClassifier/Regressor, GradientBoostingClassifier/Regressor
- KMeans, DBSCAN, AgglomerativeClustering
- PCA, StandardScaler, MinMaxScaler
- train_test_split, cross_val_score, GridSearchCV
- classification_report, confusion_matrix, roc_curve

---

## 대상 데이터셋 (기존 카테고리 미사용 + Pyodide 호환)

| 번호 | 데이터셋 | 출처 | 용도 | 비즈니스 가치 |
|------|----------|------|------|--------------|
| 01 | 와인 품질 | sklearn load_wine() | 다중 분류 입문 | 품질 예측 |
| 02 | 유방암 진단 | sklearn load_breast_cancer() | 이진 분류 | 의료 진단 |
| 03 | 당뇨병 예측 | sklearn load_diabetes() | 회귀 입문 | 질병 위험도 |
| 04 | 캘리포니아 주택 | sklearn fetch_california_housing() | 회귀 심화 | 부동산 가격 |
| 05 | 손글씨 숫자 | sklearn load_digits() | 이미지 분류 | OCR 기초 |
| 06 | 합성 데이터 | make_blobs(), make_moons() | 클러스터링 | 고객 세분화 |
| 07 | 소나 신호 | GitHub sonar.csv | 앙상블 기초 | 신호 분류 |
| 08 | 심장병 예측 | GitHub heart.csv | 앙상블 심화 | 건강 위험도 |
| 09 | 아이오노스피어 | GitHub ionosphere.csv | 하이퍼파라미터 | 신호 탐지 |
| 10 | Pima 당뇨병 | GitHub pima-diabetes.csv | 종합 프로젝트 | 실전 ML 파이프라인 |

**데이터 확인**:
- ✅ statsmodels 카테고리 미사용
- ✅ seaborn 카테고리 미사용 (iris, tips, penguins, titanic, diamonds, mpg 제외)
- ✅ sklearn 내장 데이터 (패키지 내부 포함)
- ✅ GitHub raw.githubusercontent.com (CORS 허용)

---

## 커버할 개념 (A-L)

| 개념 | 이름 | 설명 |
|------|------|------|
| A | 데이터 분할 | train_test_split, 홀드아웃 |
| B | 분류 기초 | LogisticRegression, 정확도, 혼동행렬 |
| C | 회귀 기초 | LinearRegression, MSE, R² |
| D | 전처리 | StandardScaler, MinMaxScaler, LabelEncoder |
| E | 다중 분류 | 다중 클래스, classification_report, F1 |
| F | 모델 평가 | cross_val_score, K-fold, 과적합 |
| G | 클러스터링 | KMeans, 엘보우 방법, 실루엣 점수 |
| H | 차원 축소 | PCA, 분산 설명력, 시각화 |
| I | 앙상블 | RandomForest, GradientBoosting, 특성 중요도 |
| J | 하이퍼파라미터 | GridSearchCV, RandomizedSearchCV |
| K | 파이프라인 | Pipeline, ColumnTransformer |
| L | 모델 저장/해석 | 특성 중요도, 결정 경계 시각화 |

---

## 10개 프로젝트 설계

### 01_와인품질분류 (입문) ⭐
- **데이터**: load_wine() (178행, 13특성, 3클래스)
- **목표**: 첫 ML 모델 만들기 - 와인 품종 분류
- **개념**: A(train_test_split), E(다중분류), D(스케일링 기초)
- **결과물**: 분류 정확도, 혼동행렬
- **비즈니스 가치**: 제품 품질 자동 분류

### 02_유방암진단 (입문) ⭐⭐
- **데이터**: load_breast_cancer() (569행, 30특성, 2클래스)
- **목표**: 이진 분류 모델로 양성/악성 판별
- **개념**: A, B(이진분류), D(StandardScaler)
- **결과물**: 정밀도, 재현율, F1 점수
- **비즈니스 가치**: 의료 진단 자동화

### 03_당뇨병진행도예측 (기초) ⭐⭐
- **데이터**: load_diabetes() (442행, 10특성, 연속값)
- **목표**: 선형 회귀로 질병 진행도 예측
- **개념**: A, C(LinearRegression, MSE, R²), D
- **결과물**: 예측 vs 실제 그래프, 잔차 분포
- **비즈니스 가치**: 건강 위험도 예측

### 04_주택가격예측 (기초) ⭐⭐⭐
- **데이터**: fetch_california_housing() (20,640행, 8특성)
- **목표**: 다중 특성으로 주택 가격 예측
- **개념**: A, C, D, F(cross_val_score)
- **결과물**: 교차 검증 점수, 특성별 영향도
- **비즈니스 가치**: 부동산 가격 책정

### 05_손글씨숫자인식 (기초) ⭐⭐⭐
- **데이터**: load_digits() (1,797행, 64특성, 10클래스)
- **목표**: 이미지 데이터로 숫자 분류
- **개념**: A, E, D, H(PCA 시각화)
- **결과물**: 10개 숫자 분류, 오분류 분석
- **비즈니스 가치**: OCR, 문서 자동화

### 06_고객세분화 (중급) ⭐⭐⭐
- **데이터**: make_blobs(), make_moons() (합성)
- **목표**: K-Means로 고객 군집화
- **개념**: G(KMeans, 엘보우, 실루엣), H(PCA), D
- **결과물**: 군집 시각화, 최적 K 선택
- **비즈니스 가치**: 마케팅 세분화

### 07_소나신호분류 (중급) ⭐⭐⭐⭐
- **데이터**: sonar.csv (208행, 60특성, 2클래스)
- **목표**: 랜덤 포레스트로 신호 분류
- **개념**: A, B, D, I(RandomForest, 특성 중요도)
- **결과물**: 특성 중요도 막대 그래프, ROC 곡선
- **비즈니스 가치**: 신호 탐지 자동화

### 08_심장병예측 (중급) ⭐⭐⭐⭐
- **데이터**: heart.csv (303행, 13특성, 2클래스)
- **목표**: GradientBoosting으로 심장병 예측
- **개념**: A, B, D, F, I(GradientBoosting)
- **결과물**: 교차 검증, 앙상블 비교
- **비즈니스 가치**: 건강 관리 시스템

### 09_신호탐지최적화 (심화) ⭐⭐⭐⭐
- **데이터**: ionosphere.csv (351행, 34특성, 2클래스)
- **목표**: GridSearchCV로 최적 하이퍼파라미터 탐색
- **개념**: A, B, D, I, J(GridSearchCV)
- **결과물**: 최적 파라미터, 튜닝 전후 비교
- **비즈니스 가치**: 레이더 시스템

### 10_종합ML파이프라인 (심화) ⭐⭐⭐⭐⭐
- **데이터**: pima-diabetes.csv (768행, 8특성, 2클래스)
- **목표**: 전체 ML 워크플로우 구축
- **개념**: A-L 모든 개념 종합
- **결과물**: 완전한 파이프라인, 모델 비교 리포트
- **비즈니스 가치**: 실전 ML 시스템 구축

---

## 개념 분배 매트릭스

| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A 데이터분할 | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ |
| B 분류기초 | | ✓ | | | | | ✓ | ✓ | ✓ | ✓ |
| C 회귀기초 | | | ✓ | ✓ | | | | | | ✓ |
| D 전처리 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| E 다중분류 | ✓ | | | | ✓ | | | | | ✓ |
| F 모델평가 | | | | ✓ | | | | ✓ | | ✓ |
| G 클러스터링 | | | | | | ✓ | | | | ✓ |
| H 차원축소 | | | | | ✓ | ✓ | | | | ✓ |
| I 앙상블 | | | | | | | ✓ | ✓ | ✓ | ✓ |
| J 하이퍼파라미터 | | | | | | | | | ✓ | ✓ |
| K 파이프라인 | | | | | | | | | | ✓ |
| L 모델해석 | | | | | | | ✓ | | | ✓ |

**반복 학습 확인**:
- 모든 개념 최소 3회 이상 등장
- A, D는 거의 매 프로젝트에서 반복 (기본기)
- 난이도 순차 증가

---

## 파일 구조 예시 (01_와인품질분류.yaml)

```yaml
meta:
  id: sklearn_01
  title: 와인품질분류
  order: 1
  category: sklearn
  difficulty: "⭐"
  badge: 입문
  tags: ["분류", "train_test_split", "다중분류", "와인"]
  seo:
    title: "scikit-learn 분류 입문 - 와인 품종 분류하기"
    description: "첫 ML 모델을 만들어봅니다. train_test_split으로 데이터를 나누고, LogisticRegression으로 와인 품종을 분류합니다."
    keywords: ["scikit-learn", "분류", "LogisticRegression", "와인", "머신러닝"]

intro:
  emoji: "🍷"
  goal: 첫 머신러닝 모델을 만들어 와인 품종을 분류합니다.
  description: scikit-learn의 기본 워크플로우를 배웁니다. 데이터 분할, 모델 학습, 예측, 평가의 전체 과정을 익힙니다.

sections:
- id: step1_install
  title: 1단계. scikit-learn 설치
  subtitle: pyodide 환경 설정
  blocks:
  - type: text
    content: scikit-learn은 Python 머신러닝의 표준 라이브러리입니다. pyodide 환경에서는 micropip으로 설치합니다. 초기 로딩에 약간의 시간이 걸릴 수 있습니다.
  - type: code
    language: python
    title: scikit-learn 설치
    description: micropip으로 패키지 설치
    content: |-
      import micropip
      await micropip.install('scikit-learn')
  - type: tip
    content: scikit-learn 설치 시 약 10-20MB의 데이터를 다운로드합니다. 처음 한 번만 설치하면 세션 동안 유지됩니다.

- id: step2_load
  title: 2단계. 데이터 불러오기
  subtitle: load_wine()
  blocks:
  - type: text
    content: sklearn.datasets에는 다양한 내장 데이터셋이 있습니다. load_wine()은 178개 와인 샘플의 13가지 화학 성분 측정값과 3가지 품종 레이블을 제공합니다.
  - type: code
    language: python
    title: 와인 데이터 로드
    description: sklearn 내장 데이터 불러오기
    content: |-
      from sklearn.datasets import load_wine
      import pandas as pd

      wine = load_wine()
      X = pd.DataFrame(wine.data, columns=wine.feature_names)
      y = wine.target
      X.shape
  - type: tip
    content: load_wine()은 Bunch 객체를 반환합니다. data는 특성(X), target은 레이블(y), feature_names는 컬럼명, target_names는 클래스명입니다.

- id: step3_split
  title: 3단계. 데이터 분할
  subtitle: train_test_split
  blocks:
  - type: text
    content: 머신러닝에서 가장 중요한 원칙은 "학습에 사용하지 않은 데이터로 평가"입니다. train_test_split으로 데이터를 학습용(train)과 테스트용(test)으로 나눕니다.
  - type: code
    language: python
    title: 학습/테스트 분할
    description: 데이터를 80:20으로 분할
    content: |-
      from sklearn.model_selection import train_test_split

      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)
      xTrain.shape, xTest.shape
  - type: tip
    content: test_size=0.2는 20%를 테스트용으로 분리합니다. random_state는 재현성을 위한 시드값으로, 같은 값이면 항상 같은 분할 결과가 나옵니다.

...

- id: practice
  title: 실습
  subtitle: 와인 분류 프로젝트
  blocks:
  - type: text
    content: 품질 관리 담당자가 되어 와인 품종 분류 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가까지 전 과정을 독립적으로 수행합니다. train_test_split, 스케일링, 분류 모델, 정확도 평가를 모두 활용합니다.
  - type: tip
    content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  - type: expansion
    title: "미션1: 스케일링 없이 vs 스케일링 후 정확도 비교"
    code: |-
      from sklearn.datasets import load_wine
      from sklearn.model_selection import train_test_split
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import LogisticRegression
      from sklearn.metrics import accuracy_score
      import pandas as pd

      wineData = load_wine()
      xData = pd.DataFrame(wineData.data, columns=wineData.feature_names)
      yData = wineData.target

      xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)

      modelRaw = LogisticRegression(max_iter=1000)
      modelRaw.fit(xTr, yTr)
      accRaw = accuracy_score(yTe, modelRaw.predict(xTe))

      scaler = StandardScaler()
      xTrScaled = scaler.fit_transform(xTr)
      xTeScaled = scaler.transform(xTe)

      modelScaled = LogisticRegression(max_iter=1000)
      modelScaled.fit(xTrScaled, yTr)
      accScaled = accuracy_score(yTe, modelScaled.predict(xTeScaled))

      pd.DataFrame({'Model': ['Raw', 'Scaled'], 'Accuracy': [accRaw, accScaled]})
  - type: expansion
    title: "미션2: 세 품종별 분류 성능 상세 분석"
    code: |-
      from sklearn.datasets import load_wine
      from sklearn.model_selection import train_test_split
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import LogisticRegression
      from sklearn.metrics import classification_report, confusion_matrix
      import pandas as pd

      wineReport = load_wine()
      xReport = pd.DataFrame(wineReport.data, columns=wineReport.feature_names)
      yReport = wineReport.target

      xTr2, xTe2, yTr2, yTe2 = train_test_split(xReport, yReport, test_size=0.2, random_state=42)

      scaler2 = StandardScaler()
      xTr2Sc = scaler2.fit_transform(xTr2)
      xTe2Sc = scaler2.transform(xTe2)

      modelReport = LogisticRegression(max_iter=1000)
      modelReport.fit(xTr2Sc, yTr2)
      yPred = modelReport.predict(xTe2Sc)

      classification_report(yTe2, yPred, target_names=wineReport.target_names, output_dict=True)
```

---

## 변수명 규칙 (PRINCIPLES.md 준수)

### 데이터 관련
- 원본: `wine`, `cancer`, `diabetes`, `housing`, `digits`
- 특성: `X`, `xData`, `xTrain`, `xTest`, `xTr`, `xTe`
- 레이블: `y`, `yData`, `yTrain`, `yTest`, `yTr`, `yTe`
- 스케일된: `xTrainSc`, `xTestSc`, `xTrScaled`, `xTeScaled`

### 모델 관련
- 단일 모델: `model`, `clf`, `reg`
- 비교용: `modelRaw`, `modelScaled`, `modelRf`, `modelGb`
- 튜닝용: `modelTuned`, `bestModel`

### 결과 관련
- 예측값: `yPred`, `pred`
- 점수: `acc`, `score`, `mse`, `r2`
- 리포트: `report`, `cm` (confusion matrix)

### 미션별 고유화
- 미션1: `wineData`, `xData`, `yData`, `xTr`, `xTe`, `modelRaw`, `modelScaled`
- 미션2: `wineReport`, `xReport`, `yReport`, `xTr2`, `xTe2`, `modelReport`

---

## 단계별 상세 계획

### 각 프로젝트 공통 구조 (10-15 단계)

1. **설치**: micropip.install('scikit-learn')
2. **데이터 로드**: sklearn.datasets 또는 URL
3. **탐색**: shape, head(), describe()
4. **데이터 분할**: train_test_split
5. **전처리**: StandardScaler, 인코딩
6. **모델 구축**: fit()
7. **예측**: predict()
8. **평가**: accuracy, MSE, classification_report
9. **시각화**: 혼동행렬, 특성 중요도
10. **실습**: 2개 미션 (배운 개념 모두 활용)

### 난이도별 특징

- **입문 (01-02)**: train_test_split, 기본 분류, 스케일링
- **기초 (03-05)**: 회귀, 다중 분류, 교차 검증, PCA
- **중급 (06-08)**: 클러스터링, 앙상블, 특성 중요도
- **심화 (09-10)**: 하이퍼파라미터 튜닝, 파이프라인

---

## 실습 섹션 원칙 (PRINCIPLES.md 준수)

### 독립성 원칙
- 각 미션은 import문부터 시작
- 데이터 로딩 독립적으로 수행
- 변수명 미션 간 겹치지 않도록

### 누적 학습
- P01: 해당 프로젝트 개념만
- P02: P01-02 개념 모두
- P10: 모든 개념 종합

### 미션 구성
- **2개 미션** (3개 이상 금지)
- 미션1: 핵심 개념 전체 과정
- 미션2: 누적 개념 종합 + 비교/분석

---

## 검토 체크리스트

### 데이터셋 분리 확인
- [x] statsmodels 미사용 데이터셋
- [x] seaborn 미사용 (iris, tips, penguins, titanic, diamonds, mpg 제외)
- [x] sklearn 내장 + GitHub raw URL

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
- [x] camelCase 변수명
- [x] marimo 변수 재할당 고려

### Pyodide 호환성
- [x] micropip 설치 방식
- [x] n_jobs 파라미터 제거 또는 n_jobs=1
- [x] 지원되는 모듈만 사용

---

## 다음 단계

1. **PRD 승인** 받기
2. **00_sklearn소개.yaml** 작성 (코드 없는 소개 파일)
3. **01-10 프로젝트 파일** 순차 작성
4. **각 파일마다 YAML 검증** 수행
5. **Pyodide 환경 테스트** 수행
