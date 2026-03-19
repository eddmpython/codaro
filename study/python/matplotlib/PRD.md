# Matplotlib 커리큘럼 PRD

## Matplotlib 핵심 장점

### 1. 파이썬 시각화의 기본
- 모든 시각화 라이브러리의 기반 (Seaborn, Pandas plot 등)
- 논문, 보고서용 고품질 정적 이미지 생성
- 세밀한 커스터마이징 가능

### 2. 완전한 제어권
- 그래프의 모든 요소를 픽셀 단위로 조정
- Figure, Axes, Artist 계층 구조 이해
- 복잡한 레이아웃 구성 가능

### 3. 풍부한 생태계
- 수십 년간 축적된 문서와 예제
- 과학/공학 분야 표준
- 다양한 백엔드 지원 (PNG, PDF, SVG 등)

### 4. Pyodide 완벽 호환
- 브라우저에서 바로 실행
- 별도 설치 없이 사용 가능

---

## 데이터셋

**사용할 데이터** (pyodide 완벽 호환):
```python
import numpy as np
import pandas as pd

np.random.seed(42)
data = pd.DataFrame({...})

import seaborn as sns
tips = sns.load_dataset('tips')
iris = sns.load_dataset('iris')
penguins = sns.load_dataset('penguins')
```

**GitHub Raw URL 데이터**:
```python
baseUrl = "https://raw.githubusercontent.com"
gapminder = pd.read_csv(f"{baseUrl}/plotly/datasets/master/gapminder_unfiltered.csv")
```

---

## 커버할 개념 목록

### A. 기본 차트 (pyplot)
| ID | 개념 | 함수 |
|----|------|------|
| A1 | 선 그래프 | plt.plot() |
| A2 | 산점도 | plt.scatter() |
| A3 | 막대 그래프 | plt.bar(), plt.barh() |
| A4 | 히스토그램 | plt.hist() |
| A5 | 파이 차트 | plt.pie() |
| A6 | 박스 플롯 | plt.boxplot() |
| A7 | 바이올린 플롯 | plt.violinplot() |
| A8 | 영역 차트 | plt.fill_between() |

### B. 고급 차트
| ID | 개념 | 함수 |
|----|------|------|
| B1 | 히트맵 | plt.imshow(), plt.pcolormesh() |
| B2 | 등고선 | plt.contour(), plt.contourf() |
| B3 | 3D 플롯 | Axes3D, plot_surface() |
| B4 | 오차 막대 | plt.errorbar() |
| B5 | 스택 영역 | plt.stackplot() |
| B6 | 스텝 차트 | plt.step() |
| B7 | 극좌표 | projection='polar' |
| B8 | 퀴버(화살표) | plt.quiver() |

### C. Figure와 Axes
| ID | 개념 | 함수/메서드 |
|----|------|-------------|
| C1 | Figure 생성 | plt.figure() |
| C2 | 서브플롯 | plt.subplots() |
| C3 | 그리드 스펙 | GridSpec |
| C4 | 트윈 축 | ax.twinx(), ax.twiny() |
| C5 | 인셋 축 | ax.inset_axes() |
| C6 | 축 공유 | sharex, sharey |

### D. 스타일링
| ID | 개념 | 함수/파라미터 |
|----|------|---------------|
| D1 | 제목/라벨 | set_title(), set_xlabel(), set_ylabel() |
| D2 | 범례 | legend() |
| D3 | 색상 | color, cmap |
| D4 | 선 스타일 | linestyle, linewidth |
| D5 | 마커 | marker, markersize |
| D6 | 축 범위 | set_xlim(), set_ylim() |
| D7 | 눈금 | set_xticks(), set_yticks() |
| D8 | 그리드 | grid() |
| D9 | 스파인 | spines |
| D10 | 스타일 시트 | plt.style.use() |

### E. 주석과 텍스트
| ID | 개념 | 함수 |
|----|------|------|
| E1 | 텍스트 추가 | ax.text() |
| E2 | 주석 화살표 | ax.annotate() |
| E3 | 수학 표현식 | LaTeX ($...$) |
| E4 | 텍스트 박스 | bbox 파라미터 |

### F. 컬러맵과 컬러바
| ID | 개념 | 함수/파라미터 |
|----|------|---------------|
| F1 | 컬러맵 선택 | cmap |
| F2 | 컬러바 추가 | plt.colorbar() |
| F3 | 색상 정규화 | Normalize, LogNorm |
| F4 | 커스텀 컬러맵 | LinearSegmentedColormap |

### G. 저장과 출력
| ID | 개념 | 함수 |
|----|------|------|
| G1 | 파일 저장 | plt.savefig() |
| G2 | 해상도 설정 | dpi |
| G3 | 투명 배경 | transparent |
| G4 | tight 레이아웃 | plt.tight_layout() |

---

## 10개 프로젝트 정의

### P01. 주가 추세 분석 (입문)
**결과물**: 일별 주가 변동 선 그래프
**데이터**: 주식 데이터 (생성)
**개념**: A1(plot), C1(figure), D1(title/label), D2(legend), D4(linestyle), D8(grid)

### P02. 팁 데이터 분포 탐색 (입문)
**결과물**: 팁 금액 분포 히스토그램과 박스플롯
**데이터**: tips (seaborn)
**개념**: A4(hist), A6(boxplot), C2(subplots), D1, D3(color), D6(xlim/ylim)

### P03. 붓꽃 품종 산점도 (기초)
**결과물**: 품종별 꽃잎/꽃받침 산점도
**데이터**: iris (seaborn)
**개념**: A2(scatter), D2(legend), D3, D5(marker), E1(text)

### P04. 대륙별 인구 비교 (기초)
**결과물**: 대륙별 인구 막대 그래프
**데이터**: gapminder (GitHub)
**개념**: A3(bar/barh), D1, D3, D7(xticks), E2(annotate)

### P05. 펭귄 체중 분석 (기초)
**결과물**: 종별 체중 분포 바이올린/박스 비교
**데이터**: penguins (seaborn)
**개념**: A6, A7(violin), C2, C6(sharex/sharey), D1, D9(spines)

### P06. 상관관계 히트맵 (중급)
**결과물**: 변수 간 상관관계 히트맵
**데이터**: iris (seaborn)
**개념**: B1(imshow), F1(cmap), F2(colorbar), E1, D7

### P07. 시계열 다중 축 차트 (중급)
**결과물**: 온도와 강수량 이중 축 그래프
**데이터**: 날씨 데이터 (생성)
**개념**: A1, A8(fill_between), C4(twinx), D1, D2, D3, D4

### P08. 다중 패널 대시보드 (중급)
**결과물**: 4개 차트로 구성된 대시보드
**데이터**: tips (seaborn)
**개념**: C2, C3(GridSpec), A2, A3, A4, A5(pie), D10(style), G4(tight_layout)

### P09. 고급 주석 차트 (심화)
**결과물**: 주요 이벤트 표시된 주가 차트
**데이터**: 주식 데이터 (생성)
**개념**: A1, E2(annotate), E3(LaTeX), E4(bbox), B4(errorbar), D9

### P10. 종합 분석 리포트 (심화)
**결과물**: 6개 패널 분석 리포트
**데이터**: gapminder + tips
**개념**: 모든 개념 종합, C3, C5(inset_axes), F3(Normalize), G1(savefig), G2(dpi)

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 plot         |  ✓  |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
| A2 scatter      |     |     |  ✓  |     |     |     |     |  ✓  |     |  ✓  |
| A3 bar          |     |     |     |  ✓  |     |     |     |  ✓  |     |  ✓  |
| A4 hist         |     |  ✓  |     |     |     |     |     |  ✓  |     |  ✓  |
| A5 pie          |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| A6 boxplot      |     |  ✓  |     |     |  ✓  |     |     |     |     |  ✓  |
| A7 violin       |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| A8 fill_between |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| B1 imshow       |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| B4 errorbar     |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| C1 figure       |  ✓  |     |     |     |     |     |     |     |     |  ✓  |
| C2 subplots     |     |  ✓  |     |     |  ✓  |     |     |  ✓  |     |  ✓  |
| C3 GridSpec     |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| C4 twinx        |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| C5 inset_axes   |     |     |     |     |     |     |     |     |     |  ✓  |
| C6 sharex/y     |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| D1 title/label  |  ✓  |  ✓  |     |  ✓  |  ✓  |     |  ✓  |     |     |  ✓  |
| D2 legend       |  ✓  |     |  ✓  |     |     |     |  ✓  |     |     |  ✓  |
| D3 color        |     |  ✓  |  ✓  |  ✓  |     |     |  ✓  |     |     |  ✓  |
| D4 linestyle    |  ✓  |     |     |     |     |     |  ✓  |     |     |  ✓  |
| D5 marker       |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| D6 xlim/ylim    |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| D7 xticks/yticks|     |     |     |  ✓  |     |  ✓  |     |     |     |  ✓  |
| D8 grid         |  ✓  |     |     |     |     |     |     |     |     |  ✓  |
| D9 spines       |     |     |     |     |  ✓  |     |     |     |  ✓  |  ✓  |
| D10 style       |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| E1 text         |     |     |  ✓  |     |     |  ✓  |     |     |     |  ✓  |
| E2 annotate     |     |     |     |  ✓  |     |     |     |     |  ✓  |  ✓  |
| E3 LaTeX        |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| E4 bbox         |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F1 cmap         |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| F2 colorbar     |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| F3 Normalize    |     |     |     |     |     |     |     |     |     |  ✓  |
| G1 savefig      |     |     |     |     |     |     |     |     |     |  ✓  |
| G2 dpi          |     |     |     |     |     |     |     |     |     |  ✓  |
| G4 tight_layout |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
```

**커버리지 확인**: 모든 개념이 최소 2회 이상 등장

---

## 파일 목록

```
matplotlib/
├── PRD.md
├── 00_Matplotlib소개.yaml
├── 01_주가추세분석.yaml
├── 02_팁데이터분포탐색.yaml
├── 03_붓꽃품종산점도.yaml
├── 04_대륙별인구비교.yaml
├── 05_펭귄체중분석.yaml
├── 06_상관관계히트맵.yaml
├── 07_시계열다중축차트.yaml
├── 08_다중패널대시보드.yaml
├── 09_고급주석차트.yaml
└── 10_종합분석리포트.yaml
```

---

## Plotly/Altair와의 차별점

### Matplotlib 선택 이유
| 상황 | Matplotlib | Plotly/Altair |
|------|------------|---------------|
| 논문/보고서 | O (정적 고품질) | X |
| 세밀한 커스터마이징 | O | 제한적 |
| 파일 저장 (PNG/PDF) | O (기본 기능) | 추가 설정 필요 |
| 인터랙티브 | X | O |
| 학습 곡선 | 가파름 | 완만함 |

### 프로젝트 내 강조점
- Figure/Axes 객체 지향 방식 이해
- 서브플롯 레이아웃 마스터
- 고품질 이미지 저장 기법
- 스타일 시트 활용

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
    fig, ax = plt.subplots()

- type: tip
  content: plt.subplots()는 Figure와 Axes 객체를 동시에 생성합니다. fig는 전체 그림판, ax는 실제 그래프가 그려지는 영역입니다. 객체 지향 방식으로 더 세밀한 제어가 가능합니다.
```

### 4. 데이터 로드 규칙
- 첫 섹션에서만 import 및 데이터 로드
- 이후 섹션은 변수 공유 (marimo 특성)
- seaborn 내장 데이터: sns.load_dataset()
- GitHub 데이터: baseUrl + raw URL

### 5. 코드 블록 분리 원칙
- 하나의 차트 = 하나의 코드 블록
- 개념별로 분리하여 학습 효과 극대화
- 마지막에 fig 또는 ax 반환 (표현식)

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
      import matplotlib.pyplot as plt
      import numpy as np
      # 전체 과정 포함
      fig
  - type: expansion
    title: "미션2: [설명]"
    code: |-
      import matplotlib.pyplot as plt
      import pandas as pd
      # 전체 과정 포함
      fig2
```

### 7. 변수 네이밍 규칙
```python
# Figure/Axes
fig, ax = plt.subplots()
fig2, ax2 = plt.subplots()
figBar, axBar = plt.subplots()

# 데이터
data = ...
dataFiltered = ...
dataGrouped = ...

# 결과
result = ...
resultFinal = ...
```

### 8. 금지 사항
- `**강조**` 마크다운 문법 (text 블록에서)
- print() 함수
- 주석 (#)
- plt.show() (marimo에서 불필요)
- 같은 변수 재할당 (다른 셀에서)

---

## 참고 자료

- [Matplotlib 공식 문서](https://matplotlib.org/stable/)
- [Matplotlib 갤러리](https://matplotlib.org/stable/gallery/)
- [Matplotlib Cheatsheets](https://matplotlib.org/cheatsheets/)
- [Scientific Visualization Book](https://github.com/rougier/scientific-visualization-book)
