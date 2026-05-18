# Polars 커리큘럼 PRD

## Polars의 핵심 장점

1. **Lazy Evaluation**: 쿼리 최적화로 불필요한 연산 제거
2. **병렬 처리**: Rust 기반 멀티스레딩으로 모든 CPU 코어 활용
3. **메모리 효율**: Apache Arrow 컬럼 포맷으로 메모리 사용 최소화
4. **표현식 API**: 직관적이고 체이닝 가능한 문법
5. **타입 안정성**: 스키마 에러를 실행 전에 감지

## pyodide 환경 고려사항

- Polars는 pyodide 0.27+에서 공식 지원
- `pl.read_csv()` 사용 (scan_csv의 일부 기능 제한)
- 브라우저 환경에서도 빠른 성능 체감 가능

---

## 데이터셋

**GitHub Raw URL 기반** (pandas와 중복 없음):

| 프로젝트 | 데이터 | 출처 |
|---------|--------|------|
| 영화 | IMDB 영화 데이터 | kaggle datasets |
| 날씨 | 세계 도시 기온 | kaggle datasets |
| 게임 | 비디오 게임 판매 | kaggle datasets |
| 주식 | 기술주 시세 | yahoo finance |
| 음악 | Spotify 차트 | kaggle datasets |
| 부동산 | 주택 가격 | kaggle datasets |
| 스포츠 | FIFA 선수 능력치 | kaggle datasets |
| 소셜미디어 | 트윗/포스트 분석 | 생성 데이터 |

---

## 커버할 개념 목록

### A. 기본 (데이터 로드/생성)
| ID | 개념 | 함수 |
|----|------|------|
| A1 | CSV 읽기 | pl.read_csv |
| A2 | DataFrame 생성 | pl.DataFrame |
| A3 | 스키마 확인 | schema, dtypes, describe |
| A4 | 미리보기 | head, tail, sample |

### B. 선택 (Selecting)
| ID | 개념 | 함수 |
|----|------|------|
| B1 | 열 선택 | select |
| B2 | 열 참조 | pl.col |
| B3 | 리터럴 값 | pl.lit |
| B4 | 다중 열 선택 | pl.col("a", "b"), pl.all() |
| B5 | 열 제외 | exclude |

### C. 필터링 (Filtering)
| ID | 개념 | 함수 |
|----|------|------|
| C1 | 조건 필터 | filter |
| C2 | 비교 연산 | ==, >, <, >=, <= |
| C3 | 논리 연산 | &, \|, ~ |
| C4 | 문자열 포함 | str.contains |
| C5 | null 처리 | is_null, is_not_null, drop_nulls |

### D. 변환 (Transforming)
| ID | 개념 | 함수 |
|----|------|------|
| D1 | 새 열 추가 | with_columns |
| D2 | 별칭 | alias |
| D3 | 타입 변환 | cast |
| D4 | 문자열 처리 | str.to_lowercase, str.replace |
| D5 | 날짜 처리 | dt.year, dt.month, dt.day |
| D6 | 조건부 값 | when-then-otherwise |

### E. 집계 (Aggregating)
| ID | 개념 | 함수 |
|----|------|------|
| E1 | 그룹화 | group_by |
| E2 | 집계 | agg |
| E3 | 기본 집계 | sum, mean, count, min, max |
| E4 | 고급 집계 | first, last, n_unique, std |
| E5 | 다중 그룹 | group_by(["a", "b"]) |

### F. 조인/결합 (Joining)
| ID | 개념 | 함수 |
|----|------|------|
| F1 | 내부 조인 | join (how="inner") |
| F2 | 왼쪽 조인 | join (how="left") |
| F3 | 외부 조인 | join (how="outer") |
| F4 | 수직 결합 | concat |

### G. 정렬/정리 (Sorting)
| ID | 개념 | 함수 |
|----|------|------|
| G1 | 정렬 | sort |
| G2 | 내림차순 | sort(descending=True) |
| G3 | 다중 정렬 | sort(["a", "b"]) |
| G4 | 중복 제거 | unique |
| G5 | 상위/하위 N개 | head, tail, slice |

### H. Lazy 실행
| ID | 개념 | 함수 |
|----|------|------|
| H1 | Lazy 모드 | lazy() |
| H2 | 실행 | collect() |
| H3 | 쿼리 계획 | explain() |
| H4 | 스트리밍 | collect(streaming=True) |

### I. 윈도우 함수
| ID | 개념 | 함수 |
|----|------|------|
| I1 | 그룹 내 연산 | over() |
| I2 | 순위 | rank().over() |
| I3 | 이동 평균 | rolling_mean |
| I4 | 누적 합계 | cum_sum |
| I5 | 지연/선행 | shift |

### J. 고급 기능
| ID | 개념 | 함수 |
|----|------|------|
| J1 | 피벗 | pivot |
| J2 | 언피벗 | unpivot |
| J3 | 표현식 체이닝 | 메서드 체이닝 |
| J4 | 사용자 함수 | map_elements |

---

## 10개 프로젝트 정의

### P01. 영화 평점 분석 (입문)
**결과물**: 장르별 평균 평점 DataFrame
**데이터**: IMDB 영화
**개념**: A1(read_csv), A3(schema), B1(select), B2(pl.col), C1(filter), E1(group_by), E3(mean)
**핵심**: Polars 기본 문법 익히기

### P02. 날씨 데이터 분석 (입문)
**결과물**: 도시별 월평균 기온 DataFrame
**데이터**: 세계 도시 기온
**개념**: A1, B1, B2, C1, C2, D1(with_columns), D5(dt), E1, E3, G1(sort)
**핵심**: 날짜 처리와 with_columns

### P03. 게임 판매 분석 (기초)
**결과물**: 플랫폼/장르별 판매량 DataFrame
**데이터**: 비디오 게임 판매
**개념**: B1, B4(다중 열), C1, C3(논리 연산), D2(alias), E1, E2(agg), E5(다중 그룹), G1, G5(head)
**핵심**: 다중 그룹 집계와 복합 조건

### P04. 주식 데이터 분석 (기초)
**결과물**: 일일 수익률 및 이동평균 DataFrame
**데이터**: 기술주 시세
**개념**: A1, D1, D3(cast), D5, I3(rolling_mean), I4(cum_sum), I5(shift)
**핵심**: 윈도우 함수 기초

### P05. 음악 스트리밍 분석 (기초)
**결과물**: 아티스트별 인기도 순위 DataFrame
**데이터**: Spotify 차트
**개념**: B1, C1, C4(str.contains), D4(str 처리), E1, E3, I1(over), I2(rank)
**핵심**: 문자열 처리와 순위 계산

### P06. 부동산 가격 분석 (중급)
**결과물**: 지역별 가격 통계 DataFrame
**데이터**: 주택 가격
**개념**: A1, C5(null 처리), D1, D6(when-then), E1, E4(n_unique, std), F1(join)
**핵심**: 조건부 변환과 조인

### P07. 스포츠 통계 분석 (중급)
**결과물**: 포지션별 능력치 피벗 DataFrame
**데이터**: FIFA 선수 데이터
**개념**: B1, B5(exclude), C1, D1, E1, E2, F4(concat), J1(pivot)
**핵심**: 피벗과 결합

### P08. 소셜미디어 분석 (중급)
**결과물**: 시간대별 게시물 통계 DataFrame
**데이터**: 트윗/포스트
**개념**: A1, D4, D5, E1, E5, I1, I3, J2(unpivot), J3(체이닝)
**핵심**: 복합 표현식 체이닝

### P09. 대용량 로그 분석 (심화)
**결과물**: 로그 패턴 분석 DataFrame + 쿼리 계획
**데이터**: 생성된 로그 데이터
**개념**: H1(lazy), H2(collect), H3(explain), 모든 이전 개념
**핵심**: Lazy 실행과 쿼리 최적화

### P10. 실전 종합 프로젝트 (심화)
**결과물**: 통합 분석 DataFrame
**데이터**: 여러 데이터셋 결합
**개념**: 모든 개념 종합
**핵심**: 실전 데이터 파이프라인

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 read_csv       |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| A3 schema         |  ✓  |     |     |     |     |     |     |     |     |  ✓  |
| B1 select         |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| B2 pl.col         |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| B4 다중 열        |     |     |  ✓  |     |     |     |  ✓  |     |  ✓  |  ✓  |
| B5 exclude        |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| C1 filter         |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |
| C2 비교연산       |     |  ✓  |  ✓  |     |     |  ✓  |     |     |  ✓  |  ✓  |
| C3 논리연산       |     |     |  ✓  |     |     |     |     |     |  ✓  |  ✓  |
| C4 str.contains   |     |     |     |     |  ✓  |     |     |     |  ✓  |  ✓  |
| C5 null 처리      |     |     |     |     |     |  ✓  |     |     |  ✓  |  ✓  |
| D1 with_columns   |     |  ✓  |     |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| D2 alias          |     |     |  ✓  |     |     |     |     |     |  ✓  |  ✓  |
| D3 cast           |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| D4 str 처리       |     |     |     |     |  ✓  |     |     |  ✓  |     |  ✓  |
| D5 dt 처리        |     |  ✓  |     |  ✓  |     |     |     |  ✓  |     |  ✓  |
| D6 when-then      |     |     |     |     |     |  ✓  |     |     |  ✓  |  ✓  |
| E1 group_by       |  ✓  |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |  ✓  |
| E2 agg            |     |     |  ✓  |     |     |     |  ✓  |     |  ✓  |  ✓  |
| E3 기본집계       |  ✓  |  ✓  |     |     |  ✓  |     |     |     |  ✓  |  ✓  |
| E4 고급집계       |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| E5 다중그룹       |     |     |  ✓  |     |     |     |     |  ✓  |  ✓  |  ✓  |
| F1 join           |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| F4 concat         |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| G1 sort           |     |  ✓  |  ✓  |     |     |     |     |     |  ✓  |  ✓  |
| G5 head/tail      |     |     |  ✓  |     |     |     |     |     |  ✓  |  ✓  |
| H1 lazy           |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| H2 collect        |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| H3 explain        |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| I1 over           |     |     |     |     |  ✓  |     |     |  ✓  |  ✓  |  ✓  |
| I2 rank           |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| I3 rolling        |     |     |     |  ✓  |     |     |     |  ✓  |     |  ✓  |
| I4 cum_sum        |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| I5 shift          |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| J1 pivot          |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| J2 unpivot        |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| J3 체이닝         |     |     |     |     |     |     |     |  ✓  |  ✓  |  ✓  |
```

**커버리지**: 모든 개념 최소 2~3회 등장, 후반 프로젝트에서 이전 개념 반복

---

## 파일 목록

```
polars/
├── PRD.md
├── 00_Polars소개.yaml
├── 01_영화평점분석.yaml
├── 02_날씨데이터분석.yaml
├── 03_게임판매분석.yaml
├── 04_주식데이터분석.yaml
├── 05_음악스트리밍분석.yaml
├── 06_부동산가격분석.yaml
├── 07_스포츠통계분석.yaml
├── 08_소셜미디어분석.yaml
├── 09_대용량로그분석.yaml
└── 10_실전종합프로젝트.yaml
```

---

## Polars 특화 교육 전략

### 1. pandas 대비 차별점 강조
- 매 프로젝트마다 "Polars 방식"의 장점 설명
- 표현식 체이닝의 가독성
- Lazy 실행의 최적화 효과

### 2. 표현식 중심 사고
- `pl.col()` 기반 표현식 작성 연습
- 체이닝으로 복잡한 변환 구성
- 컨텍스트(select, filter, with_columns) 이해

### 3. 성능 체감
- P09에서 Lazy vs Eager 비교
- explain()으로 쿼리 계획 확인
- 실제 실행 시간 측정

### 4. pyodide 환경 최적화
- read_csv 사용 (scan_csv 대신)
- 작은 데이터셋으로 개념 학습
- 결과물 즉시 확인 가능

---

## 참고 자료

- [Polars 공식 문서](https://docs.pola.rs/)
- [Polars User Guide](https://docs.pola.rs/user-guide/)
- [Real Python - Polars GroupBy](https://realpython.com/polars-groupby/)
- [DataCamp - pandas vs Polars](https://www.datacamp.com/tutorial/high-performance-data-manipulation-in-python-pandas2-vs-polars)
