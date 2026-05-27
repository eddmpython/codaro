# Pandas 학습 콘텐츠 PRD

## 목표
- 파이썬을 모르는 사람도 판다스로 데이터 분석을 시작할 수 있게 한다
- 흥미를 유발하여 학습 진입 장벽을 낮춘다
- 엑셀 사용자가 자연스럽게 판다스로 전환할 수 있게 한다

## 타겟 독자
- 엑셀은 쓸 줄 아는데 파이썬은 모르는 사람
- 파이썬 문법을 배우다가 지친 사람
- 데이터 분석에 관심있는 완전 초급자

## 핵심 메시지

### 1. 파이썬 몰라도 된다
- 변수 = 값 이것만 알면 시작 가능
- 반복문, 조건문, 함수, 클래스 전혀 필요없음
- 오히려 엑셀 개념에 더 가까움 (스프레드시트 = DataFrame)

### 2. 판다스의 압도적 장점
- 엑셀 100만 행 한계 vs 판다스 수천만 행 가능
- 반복 작업 자동화 (매일 같은 리포트? 코드 한 번이면 끝)
- 웹에서 데이터 바로 가져오기 (read_csv, read_html)
- 무료, 어디서든 실행 가능

### 3. 대안들과의 비교 (Polars, Modin)
- Polars: 속도는 57배 빠르지만, 새 API 학습 필요, ML 라이브러리 호환성 낮음
- Modin: 판다스 API 그대로, 병렬 처리, 하지만 속도 향상 미미 (1.0x)
- 결론: **판다스로 시작 → 필요시 확장** 전략이 최적
  - 판다스가 가장 직관적
  - 가장 큰 커뮤니티와 생태계
  - 대부분의 ML/시각화 라이브러리와 호환
  - 나중에 Polars/Modin으로 확장 쉬움

### 4. 엑셀 vs 판다스
| 비교 | 엑셀 | 판다스 |
|------|------|--------|
| 대용량 | ❌ 100만 행 한계 | ✅ 수천만 행 |
| 반복작업 | ❌ 수동 반복 | ✅ 자동화 |
| 웹 데이터 | ❌ 수동 다운로드 | ✅ URL로 바로 |
| 분석 시작 | ❌ 수동 탐색 | ✅ df.info(), df.describe() 한 줄 |
| 가격 | 💰 유료 | 🆓 무료 |

## 콘텐츠 구조

### 00_판다스소개.yaml (흥미 유발용)
- mainHeader: 판다스?? 파이썬 아니고??
- hero: 변수만 알면 시작 가능
- compare: 파이썬 문법 다 배우기 vs 바로 판다스
- note: "파이썬 몰라도 됩니다" 강조
- hero: 엑셀 쓸 줄 알면 판다스 할 수 있다
- table: 엑셀 vs 판다스 비교
- sectionHeader: 그럼 Polars, Modin은?
- compare: 판다스 vs Polars vs Modin
- note: 판다스로 시작 → 확장 전략 권장
- hero: 치트시트 소개
- link: 공식 치트시트 PDF

### 01_데이터프레임이란.yaml
- DataFrame = 엑셀 스프레드시트
- 행, 열, 셀 개념
- 직접 만들어보기
- 컬럼 선택, 필터링

### 02_데이터가져오기.yaml
- read_csv (로컬 + 웹 URL)
- read_excel
- read_html (웹 표 스크래핑)
- read_json

### 03_데이터탐색.yaml
- head(), tail()
- info(), describe()
- shape, columns
- value_counts()

### (이후 계속...)

## 디자인 원칙
- 다양한 블록 타입 활용 (mainHeader, hero, compare, table, note, code)
- 코드는 최소한으로, 결과 위주로 보여주기
- "이렇게 쉽다"는 느낌 강조
- 엑셀 비유 적극 활용

## 참고 자료
- [Real Python: Polars vs Pandas](https://realpython.com/polars-vs-pandas/)
- [DataCamp: Pandas 2.0 vs Polars](https://www.datacamp.com/tutorial/high-performance-data-manipulation-in-python-pandas2-vs-polars)
- [Edlitera: Pandas vs Excel](https://www.edlitera.com/blog/posts/pandas-vs-excel-comparison)
- [Pandas for Excel Users](https://fromexceltopython.com/blog/pandas-for-excel-users/)
- [Polars User Guide: Coming from Pandas](https://docs.pola.rs/user-guide/migration/pandas/)
