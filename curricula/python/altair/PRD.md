# Altair 커리큘럼 PRD

## Altair 핵심 장점

### 1. Marimo 자동 인터랙티브 지원
- `mo.ui.altair_chart()`로 자동 반응형 차트
- 브러싱, 선택이 자동으로 데이터와 연동
- 추가 코드 없이 인터랙티브 차트 생성

### 2. 선언적 문법 (Declarative Grammar)
- "무엇을 시각화할지"만 선언
- Vega-Lite 문법 기반으로 간결한 코드
- 차트 세부사항은 자동 처리

### 3. 통계 시각화 특화
- 차트 내에서 직접 집계/변환/필터링
- pandas 전처리 없이 시각화 가능
- 그룹별 통계 자동 계산

### 4. 인터랙션 내장
- 브러싱(brushing), 선택(selection), 링킹(linking)
- 조건부 인코딩으로 동적 스타일링
- 여러 차트 간 연동

---

## 데이터셋

**altair.datasets 내장 데이터** (로컬 번들, 네트워크 불필요):
```python
from altair.datasets import data

data.cars()       # 자동차 데이터 (406행)
data.iris()       # 붓꽃 데이터 (150행)
data.stocks()     # 주식 데이터 (560행)
data.seattle_weather()  # 시애틀 날씨 (1461행)
data.barley()     # 보리 수확량 (120행)
data.movies()     # 영화 데이터 (3200+행)
data.gapminder()  # 세계 발전 데이터 (URL)
data.airports()   # 공항 데이터 (URL)
```

---

## 커버할 개념 목록

### A. 기본 마크 (Marks)
| ID | 개념 | 메서드 |
|----|------|--------|
| A1 | 점 | mark_point() |
| A2 | 선 | mark_line() |
| A3 | 막대 | mark_bar() |
| A4 | 영역 | mark_area() |
| A5 | 원 | mark_circle() |
| A6 | 사각형 | mark_rect() |
| A7 | 텍스트 | mark_text() |
| A8 | 박스플롯 | mark_boxplot() |

### B. 인코딩 채널 (Encodings)
| ID | 개념 | 파라미터 |
|----|------|----------|
| B1 | 위치 | x, y |
| B2 | 색상 | color |
| B3 | 크기 | size |
| B4 | 모양 | shape |
| B5 | 툴팁 | tooltip |
| B6 | 정렬 | order |
| B7 | 행/열 분할 | row, column |
| B8 | 투명도 | opacity |

### C. 데이터 타입 (Types)
| ID | 개념 | 약어 |
|----|------|------|
| C1 | 수량형 | :Q (Quantitative) |
| C2 | 명목형 | :N (Nominal) |
| C3 | 순서형 | :O (Ordinal) |
| C4 | 시계열 | :T (Temporal) |

### D. 데이터 변환 (Transforms)
| ID | 개념 | 메서드 |
|----|------|--------|
| D1 | 집계 | transform_aggregate() |
| D2 | 필터 | transform_filter() |
| D3 | 계산 | transform_calculate() |
| D4 | 구간화 | transform_bin() |
| D5 | 접기 | transform_fold() |
| D6 | 조회 | transform_lookup() |
| D7 | 윈도우 | transform_window() |

### E. 인터랙션 (Interactions)
| ID | 개념 | 메서드/함수 |
|----|------|-------------|
| E1 | 구간 선택 | selection_interval() |
| E2 | 점 선택 | selection_point() |
| E3 | 파라미터 추가 | add_params() |
| E4 | 조건부 | when().then().otherwise() |
| E5 | 바인딩 | bind (슬라이더, 드롭다운) |

### F. 복합 차트 (Compound Charts)
| ID | 개념 | 연산자/메서드 |
|----|------|---------------|
| F1 | 레이어링 | + (layer) |
| F2 | 수평 연결 | | (hconcat) |
| F3 | 수직 연결 | & (vconcat) |
| F4 | 반복 | repeat() |
| F5 | 패싯 | facet() |

### G. 스타일링 (Styling)
| ID | 개념 | 메서드 |
|----|------|--------|
| G1 | 속성 설정 | properties() |
| G2 | 축 설정 | alt.X().axis() |
| G3 | 범례 설정 | alt.Color().legend() |
| G4 | 스케일 설정 | alt.Scale() |
| G5 | 테마 | alt.themes |
| G6 | 마크 스타일 | mark_*(color, size, ...) |

---

## 10개 프로젝트 정의

### P01. 자동차 연비 탐색 (입문)
**결과물**: 마력-연비 산점도
**데이터**: cars
**개념**: A1(point), B1(x,y), B2(color), B5(tooltip), C1(Q), C2(N)
**Marimo 장점**: 점 클릭/호버 자동 인터랙션

### P02. 붓꽃 품종 구분 (입문)
**결과물**: 품종별 특성 비교 차트
**데이터**: iris
**개념**: A1, A5(circle), B1, B2, B3(size), B4(shape), G6(마크스타일)
**Marimo 장점**: 자동 브러싱으로 품종 선택

### P03. 주식 시계열 분석 (기초)
**결과물**: 다중 주식 라인 차트
**데이터**: stocks
**개념**: A2(line), B1, B2, C4(T), F1(layer), G1(properties)
**Marimo 장점**: 범례 클릭으로 주식 필터링

### P04. 시애틀 날씨 패턴 (기초)
**결과물**: 월별 기온/강수량 시각화
**데이터**: seattle_weather
**개념**: A3(bar), A4(area), B1, B2, C3(O), C4, D1(aggregate), G2(axis)
**Marimo 장점**: 기간 브러싱으로 상세 조회

### P05. 보리 수확량 비교 (기초)
**결과물**: 농장/품종별 수확량 비교
**데이터**: barley
**개념**: A1, A3, B1, B2, B7(row/column), D2(filter), F5(facet)
**Marimo 장점**: 농장 선택 시 품종별 비교

### P06. 영화 평점 분석 (중급)
**결과물**: 장르별 평점 분포 히트맵
**데이터**: movies
**개념**: A6(rect), A8(boxplot), B1, B2, D1, D4(bin), G3(legend), G4(scale)
**Marimo 장점**: 구간 선택으로 영화 목록 표시

### P07. 인터랙티브 필터 대시보드 (중급)
**결과물**: 동적 필터링 차트
**데이터**: cars
**개념**: E1(interval), E2(point), E3(add_params), E4(when), E5(bind)
**Marimo 장점**: 슬라이더/드롭다운 자동 연동

### P08. 다중 뷰 연결 (중급)
**결과물**: 브러싱 연동 다중 차트
**데이터**: iris
**개념**: E1, E3, E4, F1(layer), F2(hconcat), F3(vconcat), F4(repeat)
**Marimo 장점**: 하나 선택 시 전체 차트 연동

### P09. 고급 데이터 변환 (심화)
**결과물**: 복합 통계 시각화
**데이터**: movies + stocks
**개념**: D1, D3(calculate), D5(fold), D6(lookup), D7(window), A7(text)
**Marimo 장점**: 변환 결과 실시간 확인

### P10. 종합 인터랙티브 대시보드 (심화)
**결과물**: 완전한 탐색형 대시보드
**데이터**: cars
**개념**: 모든 개념 종합
**Marimo 장점**: 전체 인터랙션 통합

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 point      |  ✓  |  ✓  |     |     |  ✓  |     |  ✓  |  ✓  |     |  ✓  |
| A2 line       |     |     |  ✓  |     |     |     |     |     |  ✓  |  ✓  |
| A3 bar        |     |     |     |  ✓  |  ✓  |     |     |     |     |  ✓  |
| A4 area       |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| A5 circle     |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| A6 rect       |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| A7 text       |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| A8 boxplot    |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| B1 x,y        |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| B2 color      |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| B3 size       |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| B4 shape      |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| B5 tooltip    |  ✓  |     |     |     |     |     |     |     |     |  ✓  |
| B7 row/column |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| B8 opacity    |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| C1 Q          |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| C2 N          |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| C3 O          |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| C4 T          |     |     |  ✓  |  ✓  |     |     |     |     |  ✓  |  ✓  |
| D1 aggregate  |     |     |     |  ✓  |     |  ✓  |     |     |  ✓  |  ✓  |
| D2 filter     |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| D3 calculate  |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| D4 bin        |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| D5 fold       |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| D6 lookup     |     |     |     |     |     |     |     |     |  ✓  |     |
| D7 window     |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| E1 interval   |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| E2 point      |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| E3 add_params |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| E4 when       |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| E5 bind       |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| F1 layer      |     |     |  ✓  |     |     |     |     |  ✓  |     |  ✓  |
| F2 hconcat    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| F3 vconcat    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| F4 repeat     |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| F5 facet      |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| G1 properties |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| G2 axis       |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| G3 legend     |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| G4 scale      |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| G5 theme      |     |     |     |     |     |     |     |     |     |  ✓  |
| G6 mark style |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
```

**커버리지 확인**: 모든 개념이 최소 2회 이상 등장

---

## 파일 목록

```
altair/
├── PRD.md
├── 00_Altair소개.yaml
├── 01_자동차연비탐색.yaml
├── 02_붓꽃품종구분.yaml
├── 03_주식시계열분석.yaml
├── 04_시애틀날씨패턴.yaml
├── 05_보리수확량비교.yaml
├── 06_영화평점분석.yaml
├── 07_인터랙티브필터.yaml
├── 08_다중뷰연결.yaml
├── 09_고급데이터변환.yaml
└── 10_종합대시보드.yaml
```

---

## Marimo 연동 특별 고려사항

### 자동 인터랙션 활용
```python
import marimo as mo
import altair as alt

chart = alt.Chart(data).mark_point().encode(...)
mo.ui.altair_chart(chart)
```

### 선택 데이터 활용
```python
chart = mo.ui.altair_chart(alt.Chart(data).mark_point().encode(...))
selectedData = chart.value
```

### 브러싱 연동
- Marimo가 mark 타입에 따라 자동으로 적절한 selection 추가
- 별도 add_params 없이도 기본 인터랙션 제공
- 고급 커스터마이징은 직접 selection 정의

---

## 참고 자료

- [Altair 공식 문서](https://altair-viz.github.io/)
- [Altair 갤러리](https://altair-viz.github.io/gallery/index.html)
- [Marimo Altair 연동](https://marimo.io/blog/altair)
- [Vega-Lite 문법](https://vega.github.io/vega-lite/)
- [인터랙션 가이드](https://altair-viz.github.io/user_guide/interactions.html)
