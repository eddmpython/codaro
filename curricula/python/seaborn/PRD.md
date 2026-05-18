# Seaborn 커리큘럼 PRD

## Seaborn 핵심 장점

### 1. Matplotlib 위에 구축된 고수준 인터페이스
- Matplotlib의 모든 기능 사용 가능
- 복잡한 통계 시각화를 한 줄로 구현
- Figure/Axes 개념 그대로 활용

### 2. 시맨틱 매핑 (Semantic Mapping)
- hue, style, size, col, row 파라미터로 다차원 데이터 표현
- 범례 자동 생성
- 데이터 타입(숫자/카테고리) 자동 인식

### 3. 아름다운 기본 스타일
- 바로 논문 수준의 차트 생성
- 과학적으로 설계된 색상 팔레트
- 눈금, 격자, 배경 최적화

### 4. 탐색적 데이터 분석(EDA) 최적화
- 몇 줄 코드로 복잡한 분석 차트
- 빠른 프로토타이핑
- 통계량 자동 계산 및 표시

### 5. Pyodide 완벽 호환
- sns.load_dataset()으로 GitHub에서 데이터 로드
- 브라우저에서 바로 실행

---

## 데이터셋

**Seaborn 내장 데이터** (pyodide 완벽 호환):
```python
import seaborn as sns

iris = sns.load_dataset('iris')
tips = sns.load_dataset('tips')
penguins = sns.load_dataset('penguins')
titanic = sns.load_dataset('titanic')
flights = sns.load_dataset('flights')
diamonds = sns.load_dataset('diamonds')
mpg = sns.load_dataset('mpg')
exercise = sns.load_dataset('exercise')
anscombe = sns.load_dataset('anscombe')
```

**GitHub Raw URL 데이터**:
```python
baseUrl = "https://raw.githubusercontent.com"
gapminder = pd.read_csv(f"{baseUrl}/plotly/datasets/master/gapminder_unfiltered.csv")
```

---

## 커버할 개념 목록

### A. 관계형 차트 (Relational)
| ID | 개념 | 함수 |
|----|------|------|
| A1 | 산점도 | scatterplot() |
| A2 | 선 그래프 | lineplot() |
| A3 | 관계형 다중패널 | relplot() |

### B. 분포형 차트 (Distribution)
| ID | 개념 | 함수 |
|----|------|------|
| B1 | 히스토그램 | histplot() |
| B2 | 커널밀도 | kdeplot() |
| B3 | 분포 다중패널 | displot() |
| B4 | 러그 플롯 | rugplot() |

### C. 범주형 차트 (Categorical)
| ID | 개념 | 함수 |
|----|------|------|
| C1 | 스트립 플롯 | stripplot() |
| C2 | 스웜 플롯 | swarmplot() |
| C3 | 박스 플롯 | boxplot() |
| C4 | 바이올린 플롯 | violinplot() |
| C5 | 막대 그래프 | barplot() |
| C6 | 카운트 플롯 | countplot() |
| C7 | 포인트 플롯 | pointplot() |
| C8 | 범주형 다중패널 | catplot() |

### D. 회귀 차트 (Regression)
| ID | 개념 | 함수 |
|----|------|------|
| D1 | 회귀 플롯 | regplot() |
| D2 | 회귀 다중패널 | lmplot() |
| D3 | 잔차 플롯 | residplot() |

### E. 행렬형 차트 (Matrix)
| ID | 개념 | 함수 |
|----|------|------|
| E1 | 히트맵 | heatmap() |
| E2 | 클러스터맵 | clustermap() |

### F. 다변량 차트 (Multi-plot)
| ID | 개념 | 함수 |
|----|------|------|
| F1 | 페어 플롯 | pairplot() |
| F2 | 조인트 플롯 | jointplot() |
| F3 | 페이셋 그리드 | FacetGrid |

### G. 시맨틱 매핑
| ID | 개념 | 파라미터 |
|----|------|----------|
| G1 | 색상 구분 | hue |
| G2 | 스타일 구분 | style |
| G3 | 크기 구분 | size |
| G4 | 열 분할 | col |
| G5 | 행 분할 | row |
| G6 | 색상 팔레트 | palette |

### H. 스타일링
| ID | 개념 | 함수/파라미터 |
|----|------|---------------|
| H1 | 테마 설정 | set_theme() |
| H2 | 스타일 설정 | set_style() |
| H3 | 컨텍스트 설정 | set_context() |
| H4 | 팔레트 설정 | set_palette() |

### I. 고급 기능
| ID | 개념 | 파라미터 |
|----|------|----------|
| I1 | 다중 표시 | multiple (layer/stack/fill) |
| I2 | 통계 추정 | estimator, errorbar |
| I3 | 히트맵 값표시 | annot, fmt |
| I4 | 다항 회귀 | order |
| I5 | 신뢰구간 | ci |

---

## 10개 프로젝트 정의

### P01. 붓꽃 품종 산점도 (입문)
**결과물**: 품종별 꽃잎/꽃받침 산점도
**데이터**: iris (seaborn)
**개념**: A1(scatterplot), G1(hue), G6(palette)

### P02. 팁 데이터 분포 탐색 (입문)
**결과물**: 팁 금액 히스토그램과 산점 분포
**데이터**: tips (seaborn)
**개념**: B1(histplot), C1(stripplot), G1(hue), I1(multiple)

### P03. 펭귄 체중 분포 비교 (기초)
**결과물**: 종별/성별 체중 분포 비교
**데이터**: penguins (seaborn)
**개념**: C3(boxplot), C4(violinplot), G1(hue), A1

### P04. 광고비 판매액 회귀 (기초)
**결과물**: 광고 매체별 판매액 회귀선
**데이터**: 광고 데이터 (GitHub)
**개념**: D1(regplot), I5(ci), A1, G1

### P05. 타이타닉 생존 분석 (기초)
**결과물**: 클래스/성별 생존율 비교
**데이터**: titanic (seaborn)
**개념**: C5(barplot), C6(countplot), G1(hue), G4(col), I2(estimator)

### P06. 항공편 승객 시계열 (중급)
**결과물**: 연도/월별 승객 추이 히트맵
**데이터**: flights (seaborn)
**개념**: E1(heatmap), I3(annot), A2(lineplot), G1

### P07. 세계 기대수명 분석 (중급)
**결과물**: 대륙별 GDP-기대수명 관계
**데이터**: gapminder (GitHub)
**개념**: A3(relplot), G1(hue), G3(size), G4(col), A1

### P08. 다이아몬드 가격 분석 (중급)
**결과물**: 캐럿/컷별 가격 분포
**데이터**: diamonds (seaborn)
**개념**: B3(displot), B2(kdeplot), G1(hue), G4(col), I1(multiple)

### P09. 자동차 연비 종합 분석 (심화)
**결과물**: 연비 영향 요인 다변량 분석
**데이터**: mpg (seaborn)
**개념**: F1(pairplot), F2(jointplot), D2(lmplot), G1(hue), I4(order)

### P10. 종합 EDA 리포트 (심화)
**결과물**: 펭귄 데이터 완전 분석 리포트
**데이터**: penguins (seaborn)
**개념**: 모든 개념 종합, H1(set_theme), H2(set_style), F3(FacetGrid)

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 scatterplot    |  ✓  |     |  ✓  |  ✓  |     |     |  ✓  |     |     |  ✓  |
| A2 lineplot       |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| A3 relplot        |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| B1 histplot       |     |  ✓  |     |     |     |     |     |  ✓  |     |  ✓  |
| B2 kdeplot        |     |     |     |     |     |     |     |  ✓  |  ✓  |  ✓  |
| B3 displot        |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| C1 stripplot      |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| C2 swarmplot      |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| C3 boxplot        |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| C4 violinplot     |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| C5 barplot        |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| C6 countplot      |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| C7 pointplot      |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| C8 catplot        |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| D1 regplot        |     |     |     |  ✓  |     |     |     |     |  ✓  |  ✓  |
| D2 lmplot         |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| E1 heatmap        |     |     |     |     |     |  ✓  |     |     |  ✓  |  ✓  |
| F1 pairplot       |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F2 jointplot      |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F3 FacetGrid      |     |     |     |     |     |     |     |     |     |  ✓  |
| G1 hue            |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| G2 style          |     |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
| G3 size           |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| G4 col            |     |     |     |     |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |
| G5 row            |     |     |     |     |     |     |     |     |     |  ✓  |
| G6 palette        |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |     |     |  ✓  |
| H1 set_theme      |     |     |     |     |     |     |     |     |     |  ✓  |
| H2 set_style      |     |     |     |     |     |     |     |     |     |  ✓  |
| I1 multiple       |     |  ✓  |     |     |     |     |     |  ✓  |     |  ✓  |
| I2 estimator      |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| I3 annot          |     |     |     |     |     |  ✓  |     |     |  ✓  |  ✓  |
| I4 order          |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| I5 ci             |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
```

**커버리지 확인**: 모든 개념이 최소 2회 이상 등장

---

## 파일 목록

```
seaborn/
├── PRD.md
├── 00_Seaborn소개.yaml
├── 01_붓꽃품종산점도.yaml
├── 02_팁데이터분포탐색.yaml
├── 03_펭귄체중분포비교.yaml
├── 04_광고비판매액회귀.yaml
├── 05_타이타닉생존분석.yaml
├── 06_항공편승객시계열.yaml
├── 07_세계기대수명분석.yaml
├── 08_다이아몬드가격분석.yaml
├── 09_자동차연비종합분석.yaml
└── 10_종합EDA리포트.yaml
```

---

## Matplotlib과의 관계

### Seaborn 선택 이유
| 상황 | Seaborn | Matplotlib |
|------|---------|------------|
| 통계적 시각화 | O (한 줄) | X (수동 계산) |
| 빠른 EDA | O | △ |
| 다차원 데이터 | O (시맨틱 매핑) | △ (수동 루프) |
| 세밀한 커스터마이징 | △ | O |
| 비표준 차트 | X | O |
| 다중 패널 | O (Figure-level) | △ (GridSpec) |

### 학습 순서
1. **Matplotlib 먼저** - Figure, Axes 개념 이해
2. **Seaborn으로 확장** - 고수준 인터페이스 활용
3. **필요시 Matplotlib 결합** - 세밀한 조정

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
    sns.scatterplot(data=iris, x='sepal_length', y='sepal_width', hue='species')

- type: tip
  content: sns.scatterplot()은 두 연속 변수의 관계를 점으로 표현합니다. data에 DataFrame을 전달하고, x와 y에 컬럼명을 문자열로 지정합니다. hue에 범주형 변수를 지정하면 색상으로 그룹을 구분합니다.
```

### 4. 데이터 로드 규칙
- 첫 섹션에서만 import 및 데이터 로드
- 이후 섹션은 변수 공유 (marimo 특성)
- seaborn 내장 데이터: sns.load_dataset()
- GitHub 데이터: baseUrl + raw URL

### 5. Figure-level vs Axes-level 구분
```yaml
# Axes-level (기존 Axes에 그리기)
- type: code
  content: |-
    fig, ax = plt.subplots()
    sns.scatterplot(data=df, x='x', y='y', ax=ax)
    fig

# Figure-level (자체 Figure 생성)
- type: code
  content: |-
    g = sns.relplot(data=df, x='x', y='y', col='category')
    g.figure
```

### 6. 실습 섹션 템플릿
```yaml
- id: practice
  blocks:
  - type: text
    content: 지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.
  - type: tip
    content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  - type: expansion
    title: "미션1: [설명]"
    code: |-
      import seaborn as sns
      import matplotlib.pyplot as plt
      # 전체 과정 포함
      fig
  - type: expansion
    title: "미션2: [설명]"
    code: |-
      import seaborn as sns
      import pandas as pd
      # 전체 과정 포함
      fig2
```

### 7. 변수 네이밍 규칙
```python
# Figure
fig, ax = plt.subplots()
fig2, ax2 = plt.subplots()
figBox, axBox = plt.subplots()

# Figure-level 객체
g = sns.relplot(...)
gPair = sns.pairplot(...)

# 데이터
iris = sns.load_dataset('iris')
irisFiltered = iris[iris['species'] == 'setosa']
```

### 8. 금지 사항
- `**강조**` 마크다운 문법 (text 블록에서)
- print() 함수
- 주석 (#)
- plt.show() (marimo에서 불필요)
- 같은 변수 재할당 (다른 셀에서)

---

## 참고 자료

- [Seaborn 공식 문서](https://seaborn.pydata.org/)
- [Seaborn 갤러리](https://seaborn.pydata.org/examples/index.html)
- [Seaborn Tutorial](https://seaborn.pydata.org/tutorial.html)
- [Seaborn GitHub](https://github.com/mwaskom/seaborn)
