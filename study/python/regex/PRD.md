# Python re 정규표현식 커리큘럼 PRD

## 데이터셋

**텍스트 샘플 데이터** (pyodide 호환):

### 방법 1: 코드 내 멀티라인 문자열 (권장)
```python
sampleText = """
Contact: john.doe@email.com, jane_smith@company.co.kr
Phone: 010-1234-5678, (02)987-6543, +82-10-9999-8888
URL: https://example.com/path?id=123, www.test.org
Date: 2025-12-26, 26/12/2025, Dec 26, 2025
"""
```

### 방법 2: 공개 API (CORS 지원, pyodide 호환)
```python
from pyodide.http import open_url
import json

# JSONPlaceholder - 이메일, 전화번호, URL 포함
usersData = json.loads(open_url("https://jsonplaceholder.typicode.com/users").read())
for user in usersData:
    user['email']  # 'Sincere@april.biz'
    user['phone']  # '1-770-736-8031 x56442'
    user['website']  # 'hildegard.org'

# Bacon Ipsum - 긴 텍스트 생성 (텍스트 정제 실습)
textData = json.loads(open_url("https://baconipsum.com/api/?type=all-meat&paras=5").read())
longText = " ".join(textData)
```

### 방법 3: GitHub raw 파일
```python
from pyodide.http import open_url

baseUrl = "https://raw.githubusercontent.com"

# CSV 파일 (도시, 국가 데이터 - 특수문자 포함)
csvData = open_url(f"{baseUrl}/datasets/world-cities/master/data/world-cities.csv").read()

# 샘플 텍스트 파일 (직접 제작 권장)
# textData = open_url(f"{baseUrl}/your-username/your-repo/main/sample.txt").read()
```

**실전 데이터 소스 (10개 프로젝트용):**

| 프로젝트 | 데이터 소스 | 포함 패턴 |
|---------|-----------|----------|
| P01 이메일 추출 | JSONPlaceholder /users | 다양한 이메일 형식 |
| P02 전화번호 통일 | JSONPlaceholder /users | 여러 전화번호 형식, 확장번호 |
| P03 URL 파싱 | JSONPlaceholder /users | 웹사이트 URL |
| P04 HTML 태그 제거 | JSONPlaceholder /posts (body) + HTML 태그 추가 | HTML 마크업 |
| P05 로그 파싱 | 코드 내 서버 로그 샘플 | 타임스탬프, IP, 에러 메시지 |
| P06 날짜 변환 | 코드 내 다양한 날짜 형식 | YYYY-MM-DD, MM/DD/YYYY, 영문 날짜 |
| P07 개인정보 마스킹 | 코드 내 샘플 (가상 데이터) | 주민번호, 카드번호, 계좌번호 |
| P08 텍스트 정제 | Bacon Ipsum API | 특수문자, 공백, 대소문자 혼재 |
| P09 고급 패턴 | 코드 내 복잡한 텍스트 | 중첩 구조, 조건부 패턴 |
| P10 LLM 전처리 | JSONPlaceholder /posts + HTML | 실전 파이프라인 |

**주의사항:**
- `requests` 모듈은 pyodide에서 작동하지 않음 (socket 미지원)
- 대신 `pyodide.http.open_url()` 사용 (동기식, 간단)
- 또는 `pyodide.http.pyfetch()` 사용 (비동기, await 필요)

---

## 왜 정규표현식을 배워야 하나?

### 비정형 데이터 처리의 핵심 도구
정규표현식은 **구조화되지 않은 텍스트**에서 필요한 정보를 추출하는 가장 강력한 도구입니다. 웹 스크래핑, 로그 분석, 데이터 정제 등 실무에서 필수적으로 사용됩니다.

### LLM 시대의 토큰 절약
LLM API를 사용할 때 **토큰 비용**은 중요한 고려사항입니다. 정규표현식으로 텍스트를 전처리하면:
- **노이즈 제거**: 불필요한 특수문자, HTML 태그 등 제거로 토큰 30% 이상 절감
- **구조화**: 원하는 정보만 추출하여 프롬프트 길이 최소화
- **정규화**: 다양한 형식을 통일하여 LLM 이해도 향상

```python
# 전처리 전 (100 토큰)
rawText = "<div>Email: john@test.com</div><br><span>Phone: 010-1234-5678</span>"

# 정규표현식으로 전처리 후 (20 토큰)
cleanedText = "Email: john@test.com, Phone: 010-1234-5678"
# 토큰 80% 절약!
```

### 실무 활용 사례
- **데이터 엔지니어**: 로그 파싱, ETL 파이프라인
- **백엔드 개발자**: 입력 검증, 포맷 변환
- **데이터 분석가**: 텍스트 정제, 패턴 발견
- **AI/ML 엔지니어**: NLP 전처리, 특성 추출

---

## 커버할 개념 목록

### A. 기본 패턴 매칭
| ID | 개념 | 패턴/설명 |
|----|------|----------|
| A1 | 리터럴 매칭 | 정확한 문자열 찾기 |
| A2 | 메타문자 | `.` (모든 문자), `^` (시작), `$` (끝) |
| A3 | 문자 클래스 단축 | `\d` (숫자), `\w` (단어), `\s` (공백) |
| A4 | 부정 클래스 | `\D`, `\W`, `\S` |
| A5 | 이스케이프 | `\.`, `\*`, `\+` 등 특수문자 |

### B. 수량자 (Quantifiers)
| ID | 개념 | 패턴/설명 |
|----|------|----------|
| B1 | 0회 이상 | `*` (없거나 여러 번) |
| B2 | 1회 이상 | `+` (최소 1번) |
| B3 | 0 또는 1회 | `?` (선택적) |
| B4 | 정확한 횟수 | `{n}`, `{n,m}` |
| B5 | 탐욕적/비탐욕적 | `*?`, `+?`, `{n,m}?` |

### C. 문자 클래스와 그룹
| ID | 개념 | 패턴/설명 |
|----|------|----------|
| C1 | 문자 집합 | `[abc]`, `[a-z]`, `[0-9]` |
| C2 | 부정 집합 | `[^abc]` |
| C3 | 캡처 그룹 | `(pattern)` |
| C4 | 비캡처 그룹 | `(?:pattern)` |
| C5 | 이름 있는 그룹 | `(?P<name>pattern)` |
| C6 | 교체 | `pattern1|pattern2` |

### D. re 모듈 함수
| ID | 개념 | 함수/설명 |
|----|------|----------|
| D1 | 패턴 컴파일 | `re.compile()` |
| D2 | 찾기 (첫 매칭) | `re.search()`, `re.match()` |
| D3 | 전체 찾기 | `re.findall()`, `re.finditer()` |
| D4 | 치환 | `re.sub()`, `re.subn()` |
| D5 | 분할 | `re.split()` |
| D6 | 매치 객체 | `.group()`, `.groups()`, `.groupdict()` |

### E. 플래그 (Flags)
| ID | 개념 | 플래그/설명 |
|----|------|-----------|
| E1 | 대소문자 무시 | `re.IGNORECASE` 또는 `re.I` |
| E2 | 멀티라인 | `re.MULTILINE` 또는 `re.M` |
| E3 | 닷올 모드 | `re.DOTALL` 또는 `re.S` |
| E4 | 가독성 모드 | `re.VERBOSE` 또는 `re.X` |

### F. 고급 기능
| ID | 개념 | 패턴/설명 |
|----|------|----------|
| F1 | 긍정 전방탐색 | `(?=pattern)` |
| F2 | 부정 전방탐색 | `(?!pattern)` |
| F3 | 긍정 후방탐색 | `(?<=pattern)` |
| F4 | 부정 후방탐색 | `(?<!pattern)` |
| F5 | 역참조 | `\1`, `\2` 또는 `\g<name>` |
| F6 | 조건부 매칭 | `(?(id)yes|no)` |

### G. 실전 패턴
| ID | 개념 | 활용 |
|----|------|------|
| G1 | 이메일 검증 | 복잡한 패턴 조합 |
| G2 | URL 파싱 | 구조 분해 |
| G3 | 날짜/시간 파싱 | 다양한 형식 처리 |
| G4 | 개인정보 마스킹 | 치환과 그룹 활용 |
| G5 | HTML/XML 처리 | 태그 제거 |
| G6 | 토큰화 | 텍스트 분할 |

---

## 10개 프로젝트 정의

### P01. 이메일 주소 추출 (입문)
**결과물**: 텍스트에서 모든 이메일 주소 찾기
**데이터**: 연락처 텍스트 샘플
**개념**: A1, A3, A5, B2, C1, C6, D3
**목표**: 기본 패턴과 문자 클래스로 이메일 추출

### P02. 전화번호 형식 통일 (입문)
**결과물**: 다양한 전화번호 형식을 010-XXXX-XXXX로 통일
**데이터**: 전화번호 리스트
**개념**: A3, B4, C1, C3, D4, D6
**목표**: 그룹 캡처와 치환으로 형식 변환

### P03. URL 구조 분해 (기초)
**결과물**: URL을 프로토콜, 도메인, 경로, 쿼리로 분해
**데이터**: 다양한 URL 리스트
**개념**: A2, A5, C3, C5, C6, D2, D6
**목표**: 이름 있는 그룹으로 URL 파싱

### P04. HTML 태그 제거 (기초)
**결과물**: HTML 문서에서 순수 텍스트만 추출
**데이터**: HTML 샘플 코드
**개념**: A2, B1, B5, C4, D4, E3
**목표**: 비탐욕적 매칭으로 태그 제거

### P05. 로그 파일 분석 (기초)
**결과물**: 로그에서 에러 메시지와 타임스탬프 추출
**데이터**: 서버 로그 파일
**개념**: A2, A3, B2, C3, C5, D3, D6, E2
**목표**: 멀티라인 로그 파싱

### P06. 날짜 형식 변환 (중급)
**결과물**: 다양한 날짜 형식을 YYYY-MM-DD로 통일
**데이터**: 여러 날짜 형식 텍스트
**개념**: B4, C1, C3, C6, D1, D4, G3
**목표**: 복잡한 패턴으로 날짜 정규화

### P07. 개인정보 마스킹 (중급)
**결과물**: 주민번호, 카드번호, 계좌번호 자동 마스킹
**데이터**: 개인정보 포함 텍스트
**개념**: A3, B4, C3, D4, F5, G4
**목표**: 역참조로 부분 마스킹

### P08. 텍스트 정제 및 토큰화 (중급)
**결과물**: LLM 입력을 위한 텍스트 전처리 파이프라인
**데이터**: 소셜미디어 텍스트
**개념**: A4, B1, C2, D4, D5, E1, G6
**목표**: 노이즈 제거와 토큰 분할

### P09. 고급 패턴 매칭 (심화)
**결과물**: lookahead/lookbehind로 복잡한 조건 매칭
**데이터**: 코드 스니펫
**개념**: F1, F2, F3, F4, F5, E4
**목표**: 전방/후방 탐색 마스터

### P10. LLM 전처리 파이프라인 (심화)
**결과물**: 웹 크롤링 → 정제 → 토큰 최적화 완전 자동화
**데이터**: 실제 웹페이지 HTML
**개념**: 모든 개념 종합 활용
**목표**: 토큰 30% 절감하는 실전 파이프라인

---

## 개념 분배 매트릭스

```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A1 리터럴     |  ✓  |     |     |     |     |     |     |     |     |  ✓  |
| A2 메타문자   |     |     |  ✓  |  ✓  |  ✓  |     |     |     |     |  ✓  |
| A3 \d\w\s    |  ✓  |  ✓  |     |     |  ✓  |     |  ✓  |     |     |  ✓  |
| A4 \D\W\S    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| A5 이스케이프 |  ✓  |     |  ✓  |     |     |     |     |     |     |  ✓  |
| B1 *         |     |     |     |  ✓  |     |     |     |  ✓  |     |  ✓  |
| B2 +         |  ✓  |     |     |     |  ✓  |     |     |     |     |  ✓  |
| B3 ?         |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| B4 {n,m}     |     |  ✓  |     |     |     |  ✓  |  ✓  |     |     |  ✓  |
| B5 비탐욕    |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| C1 [abc]     |  ✓  |  ✓  |     |     |     |  ✓  |     |     |     |  ✓  |
| C2 [^abc]    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| C3 (그룹)    |     |  ✓  |  ✓  |     |  ✓  |  ✓  |  ✓  |     |     |  ✓  |
| C4 (?:)      |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| C5 (?P<>)    |     |     |  ✓  |     |  ✓  |     |     |     |     |  ✓  |
| C6 or        |  ✓  |     |  ✓  |     |     |  ✓  |     |     |     |  ✓  |
| D1 compile   |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| D2 search    |     |     |  ✓  |     |     |     |     |     |     |  ✓  |
| D3 findall   |  ✓  |     |     |     |  ✓  |     |     |     |     |  ✓  |
| D4 sub       |     |  ✓  |     |  ✓  |     |  ✓  |  ✓  |  ✓  |     |  ✓  |
| D5 split     |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| D6 group     |     |  ✓  |  ✓  |     |  ✓  |     |     |     |     |  ✓  |
| E1 re.I      |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
| E2 re.M      |     |     |     |     |  ✓  |     |     |     |     |  ✓  |
| E3 re.S      |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| E4 re.X      |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F1 (?=)      |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F2 (?!)      |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F3 (?<=)     |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F4 (?<!)     |     |     |     |     |     |     |     |     |  ✓  |  ✓  |
| F5 역참조    |     |     |     |     |     |     |  ✓  |     |  ✓  |  ✓  |
| G1 이메일    |  ✓  |     |     |     |     |     |     |     |     |  ✓  |
| G3 날짜      |     |     |     |     |     |  ✓  |     |     |     |  ✓  |
| G4 마스킹    |     |     |     |     |     |     |  ✓  |     |     |  ✓  |
| G5 HTML      |     |     |     |  ✓  |     |     |     |     |     |  ✓  |
| G6 토큰화    |     |     |     |     |     |     |     |  ✓  |     |  ✓  |
```

**커버리지 확인**: 모든 핵심 개념이 최소 2~3회 이상 반복 등장

---

## 난이도 배치

| badge | 프로젝트 | 설명 |
|-------|---------|------|
| 입문 | 01, 02 | 기본 패턴, 간단한 추출 |
| 기초 | 03, 04, 05 | 그룹, 치환, 파싱 |
| 중급 | 06, 07, 08 | 복잡한 패턴, 전처리 |
| 심화 | 09, 10 | lookaround, 실전 파이프라인 |

---

## 파일 목록

```
regex/
├── PRD.md
├── 00_정규표현식소개.yaml
├── 01_이메일주소추출.yaml
├── 02_전화번호형식통일.yaml
├── 03_URL구조분해.yaml
├── 04_HTML태그제거.yaml
├── 05_로그파일분석.yaml
├── 06_날짜형식변환.yaml
├── 07_개인정보마스킹.yaml
├── 08_텍스트정제토큰화.yaml
├── 09_고급패턴매칭.yaml
└── 10_LLM전처리파이프라인.yaml
```

---

## 참고 자료

- [Python re 공식 문서](https://docs.python.org/ko/3/library/re.html)
- [정규식 HOWTO](https://docs.python.org/ko/3/howto/regex.html)
- [Regex Lookahead and Lookbehind](https://www.regular-expressions.info/lookaround.html)
- [RegEx for NLP Preprocessing](https://medium.com/doubleverify-engineering/how-regex-can-help-with-text-preprocessing-for-nlp-tasks-fb148d8ecb1a)
- [Mastering Regex in NLP](https://dev.to/satyam_chourasiya_99ea2e4/mastering-regex-in-nlp-from-tokenization-to-advanced-pattern-mining-5c5f)
