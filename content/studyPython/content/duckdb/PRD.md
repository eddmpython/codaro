# DuckDB SQL 커리큘럼 PRD

## DuckDB의 핵심 장점

1. **브라우저 실행**: WebAssembly로 컴파일되어 서버 없이 브라우저에서 실행
2. **SQL 표준**: 50년 역사의 표준 언어, 모든 DB에서 통용
3. **OLAP 특화**: 분석 쿼리에 최적화된 컬럼 기반 엔진
4. **pandas 연동**: `duckdb.from_df()`로 DataFrame을 바로 쿼리
5. **제로 설정**: `pip install duckdb` 한 줄로 설치 완료
6. **무료 오픈소스**: MIT 라이선스, 상업적 사용 가능

## pyodide 환경 고려사항

- httpfs 확장 미지원 → pandas로 CSV 로드 후 `duckdb.from_df()` 변환
- 싱글 스레드 기본 (멀티스레딩 실험적)
- `duckdb.sql("쿼리")` 형태로 실행
- 결과는 DuckDB Relation 객체, `.df()`로 pandas 변환 가능

---

## 데이터셋

**PRINCIPLES.md 데이터 분리 원칙 준수**:

| 프로젝트 | 데이터 | 출처 |
|---------|--------|------|
| tips | 레스토랑 팁 (244행) | seaborn-data |
| titanic | 타이타닉 생존자 (891행) | seaborn-data |

```python
import pandas as pd
import duckdb

baseUrl = "https://raw.githubusercontent.com/mwaskom/seaborn-data/master"
tips = duckdb.from_df(pd.read_csv(f"{baseUrl}/tips.csv"))
titanic = duckdb.from_df(pd.read_csv(f"{baseUrl}/titanic.csv"))
```

---

## 커버할 개념 목록

### A. 기본 (SELECT/FROM/WHERE)
| ID | 개념 | 문법 |
|----|------|------|
| A1 | 전체 선택 | SELECT * |
| A2 | 열 선택 | SELECT col1, col2 |
| A3 | 별칭 | AS alias |
| A4 | 조건 필터 | WHERE |
| A5 | 행 수 제한 | LIMIT |

### B. 비교/논리 연산
| ID | 개념 | 문법 |
|----|------|------|
| B1 | 비교 연산 | =, !=, >, <, >=, <= |
| B2 | 논리 AND | AND |
| B3 | 논리 OR | OR |
| B4 | 범위 조건 | BETWEEN a AND b |
| B5 | 목록 포함 | IN (a, b, c) |
| B6 | 패턴 매칭 | LIKE '%pattern%' |
| B7 | NULL 검사 | IS NULL, IS NOT NULL |

### C. 집계 (GROUP BY)
| ID | 개념 | 문법 |
|----|------|------|
| C1 | 그룹화 | GROUP BY |
| C2 | 행 수 | COUNT(*), COUNT(col) |
| C3 | 합계 | SUM(col) |
| C4 | 평균 | AVG(col) |
| C5 | 최소/최대 | MIN(col), MAX(col) |
| C6 | 그룹 필터 | HAVING |
| C7 | 중복 제거 | DISTINCT, COUNT(DISTINCT col) |

### D. 정렬/계산
| ID | 개념 | 문법 |
|----|------|------|
| D1 | 정렬 | ORDER BY |
| D2 | 내림차순 | DESC |
| D3 | 다중 정렬 | ORDER BY a, b DESC |
| D4 | 산술 연산 | +, -, *, / |
| D5 | 반올림 | ROUND(val, n) |
| D6 | 조건부 값 | CASE WHEN THEN ELSE END |

### E. 조인 (JOIN)
| ID | 개념 | 문법 |
|----|------|------|
| E1 | 내부 조인 | INNER JOIN ON |
| E2 | 왼쪽 조인 | LEFT JOIN ON |
| E3 | 오른쪽 조인 | RIGHT JOIN ON |
| E4 | 전체 조인 | FULL OUTER JOIN |
| E5 | 셀프 조인 | 같은 테이블 조인 |

### F. 서브쿼리
| ID | 개념 | 문법 |
|----|------|------|
| F1 | 스칼라 서브쿼리 | SELECT (SELECT ...) |
| F2 | WHERE 서브쿼리 | WHERE col IN (SELECT ...) |
| F3 | FROM 서브쿼리 | FROM (SELECT ...) AS sub |
| F4 | EXISTS | WHERE EXISTS (SELECT ...) |

### G. CTE (공통 테이블 표현식)
| ID | 개념 | 문법 |
|----|------|------|
| G1 | 기본 CTE | WITH name AS (SELECT ...) |
| G2 | 다중 CTE | WITH a AS (...), b AS (...) |
| G3 | CTE 참조 | CTE끼리 참조 |
| G4 | 재귀 CTE | WITH RECURSIVE |

### H. 윈도우 함수
| ID | 개념 | 문법 |
|----|------|------|
| H1 | 행 번호 | ROW_NUMBER() OVER() |
| H2 | 순위 | RANK(), DENSE_RANK() |
| H3 | 파티션 | OVER(PARTITION BY col) |
| H4 | 정렬 | OVER(ORDER BY col) |
| H5 | 누적 합계 | SUM() OVER(ORDER BY) |
| H6 | 이동 평균 | AVG() OVER(ROWS BETWEEN) |
| H7 | 이전/다음 값 | LAG(), LEAD() |
| H8 | 윈도우 필터 | QUALIFY |

### I. 문자열 함수
| ID | 개념 | 문법 |
|----|------|------|
| I1 | 문자열 결합 | CONCAT, \|\| |
| I2 | 부분 문자열 | SUBSTR(str, start, len) |
| I3 | 대소문자 | UPPER, LOWER |
| I4 | 공백 제거 | TRIM, LTRIM, RTRIM |
| I5 | 문자열 길이 | LENGTH |
| I6 | 문자열 치환 | REPLACE |
| I7 | 문자열 분할 | STRING_SPLIT |

### J. 날짜/시간 함수
| ID | 개념 | 문법 |
|----|------|------|
| J1 | 현재 날짜 | CURRENT_DATE, NOW() |
| J2 | 날짜 추출 | EXTRACT(YEAR FROM date) |
| J3 | 날짜 잘라내기 | DATE_TRUNC('month', date) |
| J4 | 날짜 포맷 | STRFTIME(format, date) |
| J5 | 날짜 차이 | DATE_DIFF('day', d1, d2) |

---

## 10개 프로젝트 정의

### P01. 레스토랑 팁 기초 분석 (입문)
**결과물**: 조건별 팁 데이터 필터링
**데이터**: tips
**개념**: A1, A2, A3, A4, A5, B1, B2, B3, B4, B5, D4, D5
**핵심**: SELECT, WHERE, 비교/논리 연산 마스터

### P02. 타이타닉 생존 통계 (입문)
**결과물**: 그룹별 생존율 집계
**데이터**: titanic
**개념**: A2, A4, C1, C2, C3, C4, C5, C7, D1, D2
**핵심**: GROUP BY와 집계 함수 마스터

### P03. 팁 패턴 분석 (기초)
**결과물**: 조건부 분류 및 정렬
**데이터**: tips
**개념**: A2, B1, B2, C1, C4, D1, D2, D3, D6, D5
**핵심**: CASE WHEN과 복합 정렬

### P04. 타이타닉 심층 분석 (기초)
**결과물**: 복합 조건 집계와 필터링
**데이터**: titanic
**개념**: A2, B2, B5, B7, C1, C2, C4, C6, D1, D6
**핵심**: HAVING과 NULL 처리

### P05. 팁 서브쿼리 분석 (기초)
**결과물**: 서브쿼리 기반 고급 필터링
**데이터**: tips
**개념**: A2, C1, C4, F1, F2, F3, D1
**핵심**: 서브쿼리 패턴 3가지

### P06. CTE로 단계별 분석 (중급)
**결과물**: CTE를 활용한 가독성 높은 쿼리
**데이터**: tips + titanic
**개념**: G1, G2, G3, C1, C4, D1, E1
**핵심**: CTE와 조인

### P07. 윈도우 함수 기초 (중급)
**결과물**: 순위와 누적 집계
**데이터**: tips
**개념**: H1, H2, H3, H4, H5, A2, D1
**핵심**: ROW_NUMBER, RANK, PARTITION BY

### P08. 고급 윈도우 분석 (중급)
**결과물**: 이동 평균과 비교 분석
**데이터**: titanic
**개념**: H3, H4, H5, H6, H7, H8, C1, C4
**핵심**: LAG/LEAD, 이동 평균, QUALIFY

### P09. 문자열과 패턴 (심화)
**결과물**: 텍스트 데이터 가공
**데이터**: titanic
**개념**: B6, I1, I2, I3, I4, I5, I6, D6, C1
**핵심**: LIKE, 문자열 함수 종합

### P10. 종합 프로젝트 (심화)
**결과물**: 실전 분석 파이프라인
**데이터**: tips + titanic
**개념**: 모든 개념 종합
**핵심**: 복합 쿼리 설계

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A SELECT      |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| A WHERE       |  ✓  |  ✓  |     |     |     |     |     |     |     |  ✓  |
| B 비교연산    |  ✓  |     |  ✓  |  ✓  |     |     |     |     |  ✓  |  ✓  |
| B AND/OR      |  ✓  |     |  ✓  |  ✓  |     |     |     |     |     |  ✓  |
| B IN/BETWEEN  |  ✓  |     |     |  ✓  |     |     |     |     |     |  ✓  |
| B LIKE        |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| B NULL        |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| C GROUP BY    |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |
| C COUNT/SUM   |     |  ✓  |     |  ✓  |     |     |     |     |     |  ✓  |
| C AVG         |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |     |  ✓  |     |  ✓  |
| C HAVING      |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| C DISTINCT    |     |  ✓  |     |     |     |     |     |     |     |  ✓  |
| D ORDER BY    |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |     |     |  ✓  |
| D CASE WHEN   |     |     |  ✓  |  ✓  |     |     |     |     |  ✓  |  ✓  |
| D ROUND       |  ✓  |     |  ✓  |     |     |     |     |     |     |  ✓  |
| E JOIN        |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| F 서브쿼리    |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| G CTE         |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| H ROW_NUMBER  |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| H RANK        |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| H PARTITION   |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| H 누적합계    |     |     |     |     |     |     |  ✓  |  ✓  |     |  ✓  |
| H LAG/LEAD    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| H QUALIFY     |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| I 문자열함수  |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
```

**커버리지**: 모든 개념 최소 2~3회 등장, 후반 프로젝트에서 이전 개념 반복

---

## 파일 목록

```
duckdb/
├── PRD.md
├── 00_DuckDB소개.yaml
├── 01_레스토랑팁기초.yaml
├── 02_타이타닉생존통계.yaml
├── 03_팁패턴분석.yaml
├── 04_타이타닉심층분석.yaml
├── 05_팁서브쿼리분석.yaml
├── 06_CTE단계별분석.yaml
├── 07_윈도우함수기초.yaml
├── 08_고급윈도우분석.yaml
├── 09_문자열과패턴.yaml
└── 10_종합프로젝트.yaml
```

---

## tip/note 사용 규칙

### tip 사용 (일관성 준수)
- **위치**: 새로운 SQL 개념이 처음 등장하는 코드 블록 직후
- **내용**: 해당 문법의 의미와 사용법 설명
- **형식**: title 선택, content 필수

```yaml
- type: code
  content: |-
    SELECT * FROM tips WHERE tip >= 5

- type: tip
  content: WHERE 뒤에 조건을 적으면 해당 조건을 만족하는 행만 선택됩니다. =는 같다, >=는 크거나 같다를 의미합니다.
```

### tip 사용 시점
1. 프로젝트 내에서 개념이 **처음** 등장할 때
2. 문법이 **복잡하거나** 헷갈릴 수 있을 때
3. **핵심 개념**을 강조할 때

### note 사용
- **위치**: 00_소개 파일에서 배경 설명
- **내용**: 개념적 설명, 비교, 참고 정보
- **형식**: title 필수, content 필수

```yaml
- type: note
  title: "OLAP vs OLTP"
  content: DuckDB는 OLAP(분석)에 특화되어 있습니다...
```

---

## DuckDB 특화 교육 전략

### 1. SQL 중심 사고
- 모든 쿼리는 `duckdb.sql("...")` 형태
- 파이썬 코드 최소화, SQL에 집중
- pandas 대비 SQL의 가독성 강조

### 2. 단계적 복잡도 증가
- P01-02: 기본 SELECT, WHERE, GROUP BY
- P03-05: CASE, HAVING, 서브쿼리
- P06-08: CTE, 윈도우 함수
- P09-10: 문자열 함수, 종합

### 3. 실전 패턴 학습
- 비즈니스 질문 → SQL 쿼리 변환
- "팁 비율이 높은 요일은?" → GROUP BY + AVG
- "생존율 상위 그룹은?" → HAVING + ORDER BY

### 4. pyodide 환경 최적화
- pandas로 데이터 로드 → duckdb.from_df() 변환
- 결과는 DuckDB Relation 객체로 바로 확인
- .df()로 pandas 변환 가능

---

## 참고 자료

- [DuckDB 공식 문서](https://duckdb.org/docs/)
- [DuckDB in Pyodide](https://duckdb.org/2024/10/02/pyodide)
- [DuckDB Window Functions](https://duckdb.org/2025/02/10/window-catchup)
- [MotherDuck Blog](https://motherduck.com/blog/)
