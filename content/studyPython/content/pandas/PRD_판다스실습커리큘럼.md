# PRD: 판다스 실습 중심 커리큘럼

## 핵심 컨셉
- **5개 데이터 주제**가 각각 하나의 완전한 학습 단위
- **난이도 상승형**: 매 주제마다 기초 복습 + 새로운 기능 확장
- **실습 중심**: Marimo(Pyodide)에서 바로 실행 가능한 웹 데이터만 사용
- **복습 효과**: 이전 주제에서 배운 내용을 반복하며 자연스럽게 익힘

---

## 난이도별 학습 범위

| 난이도 | 누적 학습 범위 |
|--------|---------------|
| ⭐ 아주쉬움 | read_csv(url), head, tail, shape, columns, describe, info |
| ⭐⭐ 쉬움 | + 컬럼선택, 기본필터링, value_counts, **loc, iloc** |
| ⭐⭐⭐ 보통 | + groupby, agg, 다중조건필터, **query, 슬라이싱, at/iat** |
| ⭐⭐⭐⭐ 어려움 | + 결측치처리, 타입변환, apply, map |
| ⭐⭐⭐⭐⭐ 많이어려움 | + merge, concat, pivot_table, sort_values |

---

## 5개 데이터 주제

### 01. 레스토랑 팁 분석 (tips) ⭐
**파일명**: `01_레스토랑팁분석.yaml`
**데이터**: `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv`
**컬럼**: total_bill, tip, sex, smoker, day, time, size (244행 7열)

**학습 목표**:
- 웹에서 데이터 불러오기
- 데이터 첫인상 파악하기
- pandas의 기본 구조 이해하기

**핵심 내용**:
- `import pandas as pd` - 판다스 불러오기
- `pd.read_csv(url)` - URL에서 CSV 읽기
- `df.head()`, `df.tail()` - 처음/마지막 행 보기
- `df.shape` - (행, 열) 크기
- `df.columns` - 컬럼명 목록
- `df.dtypes` - 각 컬럼의 데이터 타입
- `df.info()` - 전체 구조 요약
- `df.describe()` - 숫자 컬럼 통계

**실습 질문**:
- 총 몇 명의 손님 데이터인가?
- 평균 팁은 얼마인가?
- 가장 큰 금액은?
- 어떤 컬럼이 숫자이고 어떤 컬럼이 문자인가?

---

### 02. 타이타닉 생존자 분석 (titanic) ⭐⭐
**파일명**: `02_타이타닉생존분석.yaml`
**데이터**: `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv`
**컬럼**: survived, pclass, sex, age, sibsp, parch, fare, embarked, class, who, deck, embark_town, alive, alone (891행 15열)

**학습 목표**:
- 원하는 데이터만 선택하기 (컬럼/행)
- 조건으로 필터링하기
- loc과 iloc 차이 이해하기

**복습**: read_csv, head, shape, describe, info

**신규 학습**:
- `df['컬럼']` - 컬럼 1개 선택 (Series 반환)
- `df[['컬럼1', '컬럼2']]` - 여러 컬럼 선택 (DataFrame 반환)
- `df[df['컬럼'] == 값]` - 조건 필터링
- `df['컬럼'].value_counts()` - 값별 개수 세기
- `df.loc[행라벨, 열라벨]` - 라벨 기반 선택
- `df.iloc[행번호, 열번호]` - 위치 기반 선택
- `df.loc[조건, '컬럼']` - 조건 + 컬럼 동시 선택

**실습 질문**:
- 생존자는 몇 명인가?
- 1등석 승객 중 생존자 비율은?
- 남성 vs 여성 생존율은?
- 20세 미만 승객의 이름과 나이만 보려면?

---

### 03. 펭귄 종 비교 분석 (penguins) ⭐⭐⭐
**파일명**: `03_펭귄종비교분석.yaml`
**데이터**: `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv`
**컬럼**: species, island, bill_length_mm, bill_depth_mm, flipper_length_mm, body_mass_g, sex (344행 7열)

**학습 목표**:
- 그룹별 통계 구하기
- 복합 조건 필터링
- query로 간결하게 필터링

**복습**: read_csv, head, describe, 컬럼선택, 필터링, value_counts, loc, iloc

**신규 학습**:
- `df.groupby('컬럼').mean()` - 그룹별 평균
- `df.groupby('컬럼').agg({'컬럼': '함수'})` - 다양한 집계
- `df.groupby(['컬럼1', '컬럼2']).size()` - 다중 그룹핑
- `df[(조건1) & (조건2)]` - AND 조건
- `df[(조건1) | (조건2)]` - OR 조건
- `df['컬럼'].isin([값1, 값2])` - 여러 값 중 하나
- `df.query('컬럼 > 값')` - SQL처럼 필터링
- `df[시작:끝]` - 행 슬라이싱
- `df.at[행라벨, '컬럼']` - 단일 값 빠른 접근
- `df.iat[행번호, 열번호]` - 단일 값 위치 접근

**실습 질문**:
- 펭귄 종별 평균 체중은?
- Adelie 종 중 암컷의 평균 부리 길이는?
- 체중 4000g 이상이고 부리 길이 45mm 이상인 펭귄은?
- 가장 큰 펭귄은 어떤 종인가?

---

### 04. 붓꽃 품종 분류 준비 (iris) ⭐⭐⭐⭐
**파일명**: `04_붓꽃품종분류.yaml`
**데이터**: `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv`
**컬럼**: sepal_length, sepal_width, petal_length, petal_width, species (150행 5열)

**학습 목표**:
- 데이터 정제하기
- 데이터 변환하기
- 새 컬럼 만들기

**복습**: 전체 복습 (read_csv ~ query)

**신규 학습**:
- `df.isna()` - 결측치 확인 (True/False)
- `df.isna().sum()` - 컬럼별 결측치 개수
- `df.dropna()` - 결측치 있는 행 제거
- `df.fillna(값)` - 결측치를 특정 값으로 채우기
- `df.drop_duplicates()` - 중복 행 제거
- `df['컬럼'].astype(타입)` - 타입 변환 (int, float, str)
- `df['신규'] = df['컬럼'] * 2` - 새 컬럼 추가
- `df['컬럼'].apply(함수)` - 모든 값에 함수 적용
- `df['컬럼'].map(딕셔너리)` - 값 매핑/변환
- `df.assign(새컬럼=값)` - 새 컬럼 추가 (체이닝용)

**실습 질문**:
- 결측치가 있는 컬럼은?
- 꽃잎 면적(길이*너비) 컬럼을 추가하면?
- 품종별 평균 꽃잎 면적은?
- sepal_length를 cm→mm로 변환하려면?

---

### 05. 자동차 연비 종합 분석 (mpg) ⭐⭐⭐⭐⭐
**파일명**: `05_자동차연비분석.yaml`
**데이터**: `https://raw.githubusercontent.com/mwaskom/seaborn-data/master/mpg.csv`
**컬럼**: mpg, cylinders, displacement, horsepower, weight, acceleration, model_year, origin, name (398행 9열)

**학습 목표**:
- 데이터 합치기
- 피벗 테이블 만들기
- 정렬과 순위
- 종합 분석

**복습**: 전체 복습

**신규 학습**:
- `pd.concat([df1, df2])` - 세로로 합치기
- `pd.concat([df1, df2], axis=1)` - 가로로 합치기
- `pd.merge(df1, df2, on='컬럼')` - 공통 키로 합치기 (VLOOKUP)
- `pd.merge(df1, df2, how='left')` - LEFT JOIN
- `df.pivot_table(values, index, columns, aggfunc)` - 피벗테이블
- `df.sort_values('컬럼')` - 오름차순 정렬
- `df.sort_values('컬럼', ascending=False)` - 내림차순 정렬
- `df.nlargest(10, '컬럼')` - 상위 N개
- `df.nsmallest(10, '컬럼')` - 하위 N개
- `df.rename(columns={'old': 'new'})` - 컬럼명 변경
- `df.reset_index()` - 인덱스 초기화

**실습 질문**:
- 연도별 평균 연비 추이는?
- 제조국별, 실린더별 평균 연비 피벗테이블은?
- 가장 연비 좋은 차 TOP 10은?
- 80년대 일본차 vs 미국차 연비 비교는?

---

## 파일 구조

```
pages/studyPython/content/pandas/
├── 00_판다스소개.yaml          (기존 - 소개/동기부여)
├── 01_레스토랑팁분석.yaml      ⭐ 아주쉬움
├── 02_타이타닉생존분석.yaml    ⭐⭐ 쉬움
├── 03_펭귄종비교분석.yaml      ⭐⭐⭐ 보통
├── 04_붓꽃품종분류.yaml        ⭐⭐⭐⭐ 어려움
├── 05_자동차연비분석.yaml      ⭐⭐⭐⭐⭐ 많이어려움
└── PRD_판다스실습커리큘럼.md   (이 문서)
```

---

## 핵심 원칙

1. **매번 read_csv부터** - 복습 효과, 손에 익힘
2. **점진적 확장** - 갑자기 어려워지지 않음
3. **실제 질문** - "평균이 뭐야?" 식의 구체적 문제
4. **바로 실행** - Marimo에서 복붙하면 바로 동작
5. **완전한 커버** - 5개 끝나면 pandas 실무 기초 완성
