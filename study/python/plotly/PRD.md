# Plotly Express 커리큘럼 PRD

## 데이터셋

**px.data 내장 데이터** (pyodide 완벽 호환):
```python
px.data.gapminder()  # 세계 발전 데이터 (1704행, 8컬럼)
px.data.iris()       # 붓꽃 데이터 (150행, 6컬럼)
px.data.tips()       # 레스토랑 팁 (244행, 7컬럼)
px.data.carshare()   # 카쉐어링 (249행)
px.data.election()   # 선거 데이터 (58행)
px.data.medals_long() # 올림픽 메달
px.data.stocks()     # 주식 데이터 (505행)
px.data.wind()       # 풍향/풍속
px.data.experiment() # 실험 데이터
```

---

## 커버할 개념 목록

### A. 기본 차트
| ID | 개념 | 함수/파라미터 |
|----|------|--------------|
| A1 | 산점도 | px.scatter |
| A2 | 선 그래프 | px.line |
| A3 | 막대 그래프 | px.bar |
| A4 | 히스토그램 | px.histogram |
| A5 | 박스 플롯 | px.box |
| A6 | 바이올린 플롯 | px.violin |
| A7 | 파이 차트 | px.pie |

### B. 고급 차트
| ID | 개념 | 함수/파라미터 |
|----|------|--------------|
| B1 | 버블 차트 | px.scatter + size |
| B2 | 히트맵 | px.density_heatmap, px.imshow |
| B3 | 트리맵 | px.treemap |
| B4 | 선버스트 | px.sunburst |
| B5 | 퍼널 | px.funnel |
| B6 | 지도 (단계구분도) | px.choropleth |
| B7 | 지도 (산점도) | px.scatter_geo |
| B8 | 3D 산점도 | px.scatter_3d |
| B9 | 애니메이션 | animation_frame |

### C. 스타일링
| ID | 개념 | 함수/파라미터 |
|----|------|--------------|
| C1 | 색상 구분 | color |
| C2 | 크기 구분 | size |
| C3 | 호버 정보 | hover_name, hover_data |
| C4 | 제목/축 라벨 | title, labels |
| C5 | 로그 스케일 | log_x, log_y |
| C6 | 패싯 | facet_col, facet_row |
| C7 | 추세선 | trendline |
| C8 | 레이아웃 수정 | update_layout |
| C9 | 트레이스 수정 | update_traces |
| C10 | 색상 팔레트 | color_continuous_scale |
| C11 | 템플릿 | template |
| C12 | 서브플롯 | make_subplots |

---

## 10개 프로젝트 정의

### P01. 세계 기대수명 비교 (초급)
**결과물**: 대륙별 기대수명 막대 그래프
**데이터**: gapminder
**개념**: A3(bar), C1(color), C4(title/labels)

### P02. 팁 데이터 분포 분석 (초급)
**결과물**: 요일/시간별 팁 분포 시각화
**데이터**: tips
**개념**: A4(histogram), A5(box), C1(color), C4(title), C6(facet)

### P03. 붓꽃 품종 분류 (초급-중급)
**결과물**: 품종별 특성 산점도 매트릭스
**데이터**: iris
**개념**: A1(scatter), A6(violin), C1(color), C2(size), C3(hover), C7(trendline)

### P04. GDP와 기대수명 관계 (중급)
**결과물**: 버블차트로 국가별 발전 현황
**데이터**: gapminder
**개념**: B1(버블), C1, C2, C3(hover), C5(log), C8(layout)

### P05. 세계 인구 지도 (중급)
**결과물**: 국가별 인구 단계구분도
**데이터**: gapminder
**개념**: B6(choropleth), C1, C4, C8, C10(color_scale)

### P06. 시간에 따른 세계 변화 (중급-고급)
**결과물**: 연도별 애니메이션 버블차트
**데이터**: gapminder
**개념**: B9(animation), B1, C1, C2, C5, C8

### P07. 레스토랑 매출 분석 (중급-고급)
**결과물**: 다각도 팁 분석 대시보드
**데이터**: tips
**개념**: A3, A5, B2(heatmap), C6(facet), C8, C12(subplots)

### P08. 대륙별 계층 구조 (고급)
**결과물**: 대륙>국가 트리맵/선버스트
**데이터**: gapminder
**개념**: B3(treemap), B4(sunburst), C1, C10

### P09. 주식 시계열 분석 (고급)
**결과물**: 다중 주식 비교 차트
**데이터**: stocks
**개념**: A2(line), C6, C8, C9(traces), C11(template), C12

### P10. 종합 대시보드 (고급)
**결과물**: gapminder 완전 분석 대시보드
**데이터**: gapminder
**개념**: 모든 개념 종합

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 scatter    |     |     |  ✓  |  ✓  |     |  ✓  |     |     |     |  ✓  |
| A2 line       |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| A3 bar        |  ✓  |     |     |     |     |     |  ✓  |     |     |  ✓  |
| A4 histogram  |     |  ✓  |     |     |     |     |  ✓  |     |     |  ✓  |
| A5 box        |     |  ✓  |     |     |     |     |  ✓  |     |     |  ✓  |
| A6 violin     |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| A7 pie        |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| B1 버블       |     |     |     |  ✓  |     |  ✓  |     |     |     |  ✓  |
| B2 heatmap    |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| B3 treemap    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| B4 sunburst   |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| B6 choropleth |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| B9 animation  |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| C1 color      |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |     |  ✓  |
| C2 size       |     |     |  ✓  |  ✓  |     |  ✓  |     |     |     |  ✓  |
| C3 hover      |     |     |  ✓  |  ✓  |     |  ✓  |     |     |     |  ✓  |
| C4 title      |  ✓  |  ✓  |     |     |  ✓  |     |     |     |     |  ✓  |
| C5 log        |     |     |     |  ✓  |     |  ✓  |     |     |     |  ✓  |
| C6 facet      |     |  ✓  |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
| C7 trendline  |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| C8 layout     |     |     |     |  ✓  |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |
| C9 traces     |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| C10 colorscale|     |     |     |     |  ✓  |     |     |  ✓  |     |  ✓  |
| C11 template  |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| C12 subplots  |     |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
```

**커버리지 확인**: 모든 개념이 최소 2~3회 이상 등장

---

## 파일 목록

```
plotly/
├── PRD.md
├── 00_소개.yaml
├── 01_세계기대수명비교.yaml
├── 02_팁데이터분포분석.yaml
├── 03_붓꽃품종분류.yaml
├── 04_GDP기대수명관계.yaml
├── 05_세계인구지도.yaml
├── 06_시간에따른세계변화.yaml
├── 07_레스토랑매출분석.yaml
├── 08_대륙별계층구조.yaml
├── 09_주식시계열분석.yaml
└── 10_종합대시보드.yaml
```

---

## 참고 자료

- [Plotly Express 공식 문서](https://plotly.com/python/plotly-express/)
- [px.data 내장 데이터셋](https://plotly.com/python-api-reference/generated/plotly.express.data.html)
- [DataCamp Plotly Express Cheat Sheet](https://www.datacamp.com/cheat-sheet/plotly-express-cheat-sheet)
