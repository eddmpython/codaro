# 내장함수 카테고리 완전 계획 (Pyodide 호환)

## 카테고리 개요

**다양한 내장함수 (Built-in Functions & Standard Library)**

파이썬이 기본으로 제공하는 표준 라이브러리를 깊이 있게 학습합니다. 별도 설치 없이 `import`만으로 사용할 수 있는 강력한 도구들을 마스터합니다.

**Pyodide 환경 최적화**: 웹 브라우저에서 실행되는 Pyodide 환경에 맞춰 실제로 동작하는 모듈만 선별했습니다. threading, multiprocessing, subprocess, socket, http.client 등 브라우저 환경에서 제약이 있는 모듈은 제외되었습니다.

## 왜 이 카테고리인가?

### 필요성
1. **즉시 사용 가능**: pip 설치 없이 바로 활용
2. **실무 필수**: 모든 파이썬 프로젝트에서 사용
3. **효율성**: 검증된 고성능 구현
4. **표준화**: 어디서나 동일하게 동작

### 학습 목표
- 표준 라이브러리 완전 이해
- 실무 즉시 적용 가능
- 외부 라이브러리 의존도 감소
- 파이썬 내공 향상

## 핵심 원칙

### 1. 1파일 = 1모듈 = 깊이 있는 학습
- 각 파일은 하나의 내장 모듈만 다룸
- 모듈의 핵심 기능 완전 정복
- 실전 예제 중심

### 2. Marimo 네이티브 스타일
- print() 사용 금지
- 마지막 표현식 자동 출력
- 단일 값 또는 튜플 출력
- dict wrapping 금지

### 3. 완전 독립 섹션
- 파일 전체에서 변수명 절대 중복 금지
- camelCase 변수명 규칙
- 각 섹션 독립 실행 가능

### 4. 실전 중심
- 실무에서 자주 사용하는 패턴
- 즉시 적용 가능한 예제
- 함정과 주의사항 명시

### 5. 체계적 난이도
- 기초 → 중급 → 고급 순차 학습
- 각 섹션 내 난이도 조절
- practice: 5🟢 + 5🟡 + 10🔴

## 커리큘럼

### 기초 모듈 (Foundation)

#### 01. math - 수학 함수
- 삼각함수, 로그, 지수
- 반올림, 절댓값
- 상수 (pi, e)
- **실전**: 과학 계산, 통계

#### 02. random - 난수 생성
- 정수/실수 난수
- 시퀀스 무작위 선택
- 셔플, 샘플링
- **실전**: 게임, 시뮬레이션, 테스트 데이터

#### 03. datetime - 날짜와 시간
- date, time, datetime 객체
- 날짜 연산, 포매팅
- 시간대 처리
- **실전**: 로그, 스케줄링, 데이터 분석

#### 04. time - 시간 측정
- sleep, time()
- 성능 측정
- 타이머 구현
- **실전**: 벤치마크, 딜레이

#### 05. collections - 특수 컨테이너
- Counter, defaultdict
- deque, OrderedDict
- namedtuple, ChainMap
- **실전**: 카운팅, 큐, 효율적 자료구조

#### 06. itertools - 이터레이터 도구
- count, cycle, repeat
- combinations, permutations
- groupby, chain
- **실전**: 조합 생성, 무한 시퀀스

#### 07. functools - 함수형 프로그래밍
- reduce, partial
- lru_cache, wraps
- **실전**: 메모이제이션, 고차함수

### 파일 및 시스템 (File & System)

#### 08. os - 운영체제 인터페이스
- 파일/디렉토리 조작
- 경로 처리
- 환경 변수
- **실전**: 파일 관리, 스크립트 자동화

#### 09. pathlib - 객체지향 경로
- Path 객체
- 경로 조작, 탐색
- 파일 읽기/쓰기
- **실전**: 크로스 플랫폼 경로 처리

#### 10. sys - 시스템 파라미터
- argv, path
- stdin, stdout, stderr
- 버전 정보
- **실전**: CLI 프로그램, 시스템 정보

#### 11. glob - 파일 패턴 매칭
- 와일드카드 검색
- 재귀 검색
- **실전**: 파일 일괄 처리

#### 12. shutil - 파일 연산
- 복사, 이동, 삭제
- 압축 파일 처리
- 디스크 사용량
- **실전**: 파일 백업, 배포

### 데이터 처리 (Data Processing)

#### 13. json - JSON 처리
- dumps, loads
- 파일 읽기/쓰기
- 커스텀 인코딩
- **실전**: API, 설정 파일

#### 14. csv - CSV 처리
- reader, writer
- DictReader, DictWriter
- **실전**: 데이터 임포트/익스포트

#### 15. pickle - 객체 직렬화
- dump, load
- 바이너리 저장
- **실전**: 객체 저장, 캐싱

#### 16. struct - 바이너리 데이터
- pack, unpack
- 포맷 문자열
- **실전**: 바이너리 파일 처리

### 텍스트 및 인코딩 (Text & Encoding)

#### 17. string - 문자열 도구
- Template, Formatter
- 상수 (ascii_letters, digits)
- **실전**: 템플릿, 검증

#### 18. textwrap - 텍스트 래핑
- wrap, fill, dedent
- **실전**: 문서 포매팅

#### 19. difflib - 차이 비교
- SequenceMatcher
- unified_diff
- **실전**: 버전 비교, diff 도구

#### 20. base64 - Base64 인코딩
- encode, decode
- **실전**: 데이터 인코딩, 이메일

### 네트워크 및 통신 (Network & Communication)

#### 21. urllib - URL 처리
- urlopen, urlparse
- 요청, 응답
- **실전**: 웹 스크래핑, API 호출
- **Pyodide**: CORS 제약 있음

#### 22. email - 이메일 처리
- 메시지 생성, 파싱
- MIME
- **실전**: 이메일 자동화
- **Pyodide**: 생성/파싱 가능 (발송 불가)

### 비동기 프로그래밍 (Async Programming)

#### 23. asyncio - 비동기 I/O
- async/await
- 이벤트 루프
- **실전**: 비동기 웹, I/O
- **Pyodide**: JavaScript 이벤트 루프와 완벽 통합

### 고급 도구 (Advanced Tools)

#### 24. argparse - 명령줄 파싱
- ArgumentParser
- 인자, 옵션
- **실전**: CLI 도구

#### 25. logging - 로깅
- Logger, Handler
- 레벨, 포맷
- **실전**: 애플리케이션 로그

#### 26. unittest - 단위 테스트
- TestCase, TestSuite
- assert 메서드
- **실전**: 테스트 자동화

#### 27. timeit - 성능 측정
- timeit, repeat
- **실전**: 벤치마크

#### 28. copy - 객체 복사
- copy, deepcopy
- **실전**: 객체 복제

#### 29. pprint - 예쁜 출력
- pprint, pformat
- **실전**: 디버깅, 로그

#### 30. inspect - 객체 검사
- 함수 시그니처
- 소스 코드 추출
- **실전**: 메타프로그래밍

## 파일 구조 (Pyodide 호환 30개 모듈)

```
pages/studyPython/content/builtins/
├── PLAN.md
├── curriculum.json
├── 01_math.yaml
├── 02_random.yaml
├── 03_datetime.yaml
├── 04_time.yaml
├── 05_collections.yaml
├── 06_itertools.yaml
├── 07_functools.yaml
├── 08_os.yaml
├── 09_pathlib.yaml
├── 10_sys.yaml
├── 11_glob.yaml
├── 12_shutil.yaml
├── 13_json.yaml
├── 14_csv.yaml
├── 15_pickle.yaml
├── 16_struct.yaml
├── 17_string.yaml
├── 18_textwrap.yaml
├── 19_difflib.yaml
├── 20_base64.yaml
├── 21_urllib.yaml
├── 22_email.yaml
├── 23_asyncio.yaml
├── 24_argparse.yaml
├── 25_logging.yaml
├── 26_unittest.yaml
├── 27_timeit.yaml
├── 28_copy.yaml
├── 29_pprint.yaml
└── 30_inspect.yaml
```

### 제외된 모듈 (Pyodide 미지원)
- http.client: HTTPConnection/HTTPSConnection (소켓 미지원)
- socket: TCP/UDP 소켓 (브라우저 보안 제약)
- threading: 스레드 (Web Worker로 제한적 대체 가능하나 실용성 낮음)
- multiprocessing: 멀티프로세싱 (fork 불가능)
- subprocess: 외부 프로세스 실행 (브라우저 환경 제약)

## 파일 작성 규칙

### YAML 구조
```yaml
meta:
  id: "01_math"
  title: "math - 수학 함수"
  category: "builtins"
  tags: ["math", "수학", "계산"]
  seo:
    title: "파이썬 math 모듈 완전 정복"
    description: "math 모듈의 모든 함수를 실전 예제로 배웁니다."
    keywords: ['math', '수학함수', 'sin', 'cos', 'log']

intro:
  emoji: "🔢"
  points:
  - "삼각함수와 로그 함수"
  - "반올림과 절댓값"
  - "수학 상수 활용"
  - "실전 과학 계산"

sections:
- id: "basic_functions"
  title: "기본 수학 함수"
  subtitle: "자주 사용하는 함수들"
  blocks:
  - type: "text"
    content: "..."
  - type: "list"
    items: [...]
  - type: "code"
    language: "python"
    title: "..."
    description: "..."
    content: |-
      import math

      result = math.sqrt(16)
      result
  - type: "tip"
    content: "..."

# 6개 섹션 + practice
- id: "practice"
  title: "종합 복습"
  blocks:
  - type: "expansion"
    title: "🟢 기본1: ..."
    code: |-
      import math
      # 코드
```

### 섹션 구성 (6개 필수)
1. **기본 함수**: 가장 자주 사용하는 핵심 기능
2. **중급 함수**: 실무에서 유용한 기능
3. **고급 기능**: 심화 활용
4. **실전 패턴**: 자주 사용하는 조합
5. **주의사항**: 함정, 에러 처리
6. **종합 활용**: 실제 프로젝트 예제

### Practice 구성 (20개 필수)
- 🟢 기본 5개: 단일 함수 사용
- 🟡 응용 5개: 여러 함수 조합
- 🔴 심화 10개: 실전 프로젝트 수준

### 변수명 규칙 (30days와 동일)

**우선순위**:
1. 1단어 camelCase (최우선)
2. 동의어 활용
3. 2단어 camelCase
4. 숫자 접미사 (1-3만, 최후)

**예시**:
```python
# ✅ Good
result = math.sqrt(16)
angle = math.radians(45)
distance = math.hypot(3, 4)

# ❌ Bad - 중복
result = math.sin(0)  # result 중복!
result = math.cos(0)  # result 중복!

# ✅ Good - 동의어 사용
sinValue = math.sin(0)
cosValue = math.cos(0)
```

**동의어 예시**:
- result → output, answer, value, outcome
- data → dataset, values, items, elements
- number → num, digit, value, figure
- text → content, message, string
- list → items, elements, sequence

### 출력 규칙

**금지**:
```python
# ❌ print 사용
print(result)

# ❌ dict wrapping
{"result": value, "status": "ok"}
```

**허용**:
```python
# ✅ 단일 값
result

# ✅ 튜플
value1, value2, value3

# ✅ 리스트/딕셔너리 자체
[1, 2, 3]
{'key': 'value'}
```

## 품질 보증 (Multi-Agent)

### Agent 역할 (30days와 동일)

1. **Content Creator Agent**: 모듈 콘텐츠 작성
2. **Variable Naming Agent**: 변수 중복 검사
3. **Curriculum Validator Agent**: 표준 라이브러리 확인
4. **Output Pattern Validator Agent**: print/dict wrapping 검증
5. **YAML & Structure Validator Agent**: YAML 문법 검증

### 검증 프로세스

```bash
# 1. 변수 중복 검사
python -c "
import re
from collections import Counter
var_pattern = r'^\s{6}([a-z][a-zA-Z0-9]*)\s*='
vars = re.findall(var_pattern, content, re.MULTILINE)
duplicates = {k: v for k, v in Counter(vars).items() if v > 1}
"

# 2. YAML 검증
python -c "import yaml; yaml.safe_load(open('XX_module.yaml'))"

# 3. Output 패턴 검증
# print() 사용 0건
# dict wrapping 0건

# 4. Practice 개수 검증
# 정확히 20개 (5🟢 + 5🟡 + 10🔴)
```

## curriculum.json 구조

```json
{
  "metadata": {
    "version": "1.0",
    "category": "builtins",
    "description": "파이썬 내장 모듈 완전 정복"
  },
  "modules": [
    {
      "id": "01_math",
      "title": "math - 수학 함수",
      "file": "01_math.yaml",
      "difficulty": "beginner",
      "prerequisites": [],
      "keywords": ["math", "수학", "계산", "삼각함수"]
    },
    {
      "id": "02_random",
      "title": "random - 난수 생성",
      "file": "02_random.yaml",
      "difficulty": "beginner",
      "prerequisites": [],
      "keywords": ["random", "난수", "무작위"]
    }
    // ... 35개 모듈
  ]
}
```

## 작성 우선순위

### Phase 1: 기초 모듈 (1-7)
가장 자주 사용되는 기본 모듈
- math, random, datetime, time
- collections, itertools, functools

### Phase 2: 파일/시스템 (8-12)
파일과 시스템 작업
- os, pathlib, sys, glob, shutil

### Phase 3: 데이터 처리 (13-16)
데이터 변환과 저장
- json, csv, pickle, struct

### Phase 4: 텍스트 (17-20)
문자열 처리
- string, textwrap, difflib, base64

### Phase 5: 네트워크 (21-22)
웹과 통신
- urllib, email

### Phase 6: 비동기 (23)
비동기 프로그래밍
- asyncio

### Phase 7: 고급 도구 (24-30)
개발 도구
- argparse, logging, unittest, timeit, copy, pprint, inspect

## 성공 기준

1. **완전성**: 30개 Pyodide 호환 모듈 100% 완성
2. **품질**: 모든 파일 Multi-Agent 검증 통과
3. **실용성**: 즉시 실무 적용 가능한 예제
4. **독립성**: 각 파일 독립 학습 가능
5. **일관성**: 모든 파일 동일한 구조와 품질
6. **Pyodide 호환**: 브라우저 환경에서 100% 동작 보장

## 예상 효과

- 표준 라이브러리 완전 마스터
- 외부 라이브러리 의존도 감소
- 파이썬 내공 대폭 향상
- 실무 즉시 활용 가능
- 코드 품질 개선
