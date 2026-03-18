# 30days 완전 재설계 계획

## 재설계 이유

### 기존 문제점
1. **중복 콘텐츠**: Day 23~30이 다른 카테고리(pandas, plotly, duckdb)와 중복
2. **Marimo 장점 무시**: print() 남발, 표현식 자동 출력 미활용
3. **변수 충돌**: 섹션 간 변수명 중복으로 독립 실행 불가
4. **개념 혼재**: 한 섹션에 여러 개념, 학습 집중도 저하
5. **순서 무질서**: 뒤에서 배울 개념을 앞에서 사용
6. **패턴학습 불필요**: 정규학습만 잘 만들면 패턴학습 필요없음

## 핵심 원칙

### 1. 30days = 순수 파이썬 문법 마스터
- 라이브러리 학습은 별도 카테고리
- 언어 자체만 30일 완성

### 2. Marimo 네이티브 스타일 (curriculum 순서 준수)
- **Day 1~10**: 딕셔너리 미학습 구간 - print() 사용
- **Day 11 이후**: print() 사용 금지, 마지막 표현식 자동 출력만 사용
- **출력 규칙**: 하나의 값만 출력, dict로 여러 값 묶지 않기
- 필요시 튜플로 여러 값 출력 가능 (예: `val1, val2, val3`)
- **중요**: forbidden 개념 절대 사용 금지

### 3. 완전 독립 섹션
- 파일 전체에서 변수명 절대 중복 금지
- 변수명 규칙: `섹션주제 + 의미` 될수있으면 너무길지 않게 변수명 작성, 변수명이 길면 피곤해짐
- 각 섹션이 어떤 순서로 실행되어도 OK

### 4. 1섹션 = 1개념 = 1출력
- 섹션을 작게 쪼개기
- 한 섹션에 한 개념만
- 학습 집중도 극대화

### 5. 엄격한 커리큘럼 순서
- curriculum.json으로 관리
- 뒤 개념 앞에서 절대 사용 금지
- 자동 검증 시스템

## 새로운 커리큘럼

### Week 1: 기초 (Day 1~7)
- Day 01: Hello World, 실행 환경
- Day 02: 변수와 데이터 타입
- Day 03: 연산자
- Day 04: 문자열 기초
- Day 05: 문자열 인덱싱/슬라이싱
- Day 06: 문자열 메서드
- Day 07: 리스트 기초

### Week 2: 자료구조 (Day 8~14)
- Day 08: 리스트 고급
- Day 09: 튜플
- Day 10: 집합
- Day 11: 딕셔너리 기초
- Day 12: 딕셔너리 고급
- Day 13: 조건문
- Day 14: 반복문

### Week 3: 함수와 모듈 (Day 15~21)
- Day 15: 함수 기초
- Day 16: 함수 고급
- Day 17: 스코프와 클로저
- Day 18: 모듈과 import
- Day 19: 파일 입출력
- Day 20: 예외 처리
- Day 21: 중간 종합 복습

### Week 4: 객체지향 (Day 22~28)
- Day 22: 클래스 기초
- Day 23: 클래스 고급
- Day 24: 특수 메서드
- Day 25: 프로퍼티와 데코레이터
- Day 26: 컴프리헨션
- Day 27: 제너레이터와 이터레이터
- Day 28: 고급 문법 종합

### Week 5: 실전 (Day 29~30)
- Day 29: 알고리즘 연습
- Day 30: 최종 프로젝트

## 파일 구조

### 정규학습 파일만 존재
```
pages/studyPython/content/30days/
├── REDESIGN_PLAN.md
├── curriculum.json
├── day01_helloWorld.yaml
├── day02_variableType.yaml
├── day03_operator.yaml
...
└── day30_finalProject.yaml
```

### 패턴학습 파일 삭제
- 중복 제거
- 정규학습의 expansion으로 대체

## 섹션 작성 규칙

### 구조
```yaml
sections:
- id: unique_section_id
  title: 명확한 제목 (한 개념만)
  subtitle: 부제목
  blocks:
  - type: text
    content: 상세한 설명 (3~5문장)
  - type: list
    items:
    - 핵심 포인트 3~4개
  - type: code
    language: python
    title: 코드 제목
    description: 코드 설명
    content: |-
      uniqueVarName = 'value'
      uniqueVarName
  - type: tip (선택)
    content: 팁
```

### 변수명과 함수명 규칙

**스타일: camelCase 필수**

**1. 단순 예제용 변수 (정규 섹션)**
- 의미있는 변수만
- 같은 단어 반복 금지, 다른 문자 사용

**2. 의미 있는 변수 (복습/실전 섹션)**
- 짧은 단어 선호: `name`, `age`, `price`, `total`, `score`
- 숫자 필요시: `name1`, `age1`, `price1` 1~3정도 까지만 사용
- 같은 의미의 다른 단어 활용
  - 나쁜 예: `text, text1, text2, ..., text10`
  - 좋은 예: `text, msg, str, word, data, data1`
  
**우선순위:**
1. 1단어 (`nums`, `chars`, `items`, `data`)
2. 유사어 (이미 사용된 단어가 있으면 유사어 사용)
3. 짧은 2단어 camelCase
4. 1단어+숫자 - 1~3까지만

**3. 단어 길이 제한**
- 1단어: `name`, `age`, `val`, `num`, `text`, `msg`
- 2단어: `userName`, `itemPrice`, `userAge`
- 3단어 이상: 피하기 (너무 김)

**4. 절대 규칙**
- 파일 전체에서 중복 금지
- 섹션ID 접두어 제거
- camelCase 엄수
- practice와 정식섹션모두 적용

### 섹션 내 코드 블록 분리 원칙
**학습 효과를 위한 단계별 출력**
- 한 섹션에 여러 개념을 보여줄 때, 각 개념마다 별도 code 블록 생성
- 한 번에 여러 개를 출력하지 말고 하나씩 실행하게 함
- 학습자가 각 단계를 독립적으로 확인하며 이해도 향상

**나쁜 예 (한 블록에 모두):**
```yaml
- type: code
  content: |-
    text = 'Python'
    first = text[0]
    second = text[1]
    third = text[2]
    print('first:', first)
    print('second:', second)
    print('third:', third)
```

**좋은 예 (각각 분리):**
```yaml
- type: code
  title: "첫 번째 문자"
  content: |-
    text1 = 'Python'
    text1[0]

- type: code
  title: "두 번째 문자"
  content: |-
    text2 = 'Python'
    text2[1]

- type: code
  title: "세 번째 문자"
  content: |-
    text3 = 'Python'
    text3[2]
```

### 코드 스타일 및 출력 원칙

**기본 원칙: 1 Code Block = 1 출력**
```python
# ✅ 단일 값 출력
sectionVarName = 10
print(sectionVarName)

# ✅ 표현식 자동 출력 (Marimo 스타일)
sectionVarName = 10
sectionVarName
```

**여러 출력이 필요한 경우: Code Block 분리**
```yaml
# ❌ 나쁜 예: 한 블록에 여러 print
- type: code
  content: |-
    adv2Active = {'user1', 'user2', 'user3'}
    adv2Premium = {'user2', 'user4', 'user5'}
    adv2New = {'user5', 'user6'}
    adv2NewPremium = adv2New & adv2Premium
    adv2AllUsers = adv2Active | adv2Premium | adv2New
    adv2CountAll = len(adv2AllUsers)
    print('new_premium:', adv2NewPremium)
    print('total_users:', adv2AllUsers)
    print('count:', adv2CountAll)

# ✅ 좋은 예: 각 출력을 별도 블록으로 분리
- type: code
  title: "신규 프리미엄 사용자"
  content: |-
    adv2Active = {'user1', 'user2', 'user3'}
    adv2Premium = {'user2', 'user4', 'user5'}
    adv2New = {'user5', 'user6'}
    adv2New & adv2Premium

- type: code
  title: "전체 사용자"
  content: |-
    adv2Active2 = {'user1', 'user2', 'user3'}
    adv2Premium2 = {'user2', 'user4', 'user5'}
    adv2New2 = {'user5', 'user6'}
    adv2Active2 | adv2Premium2 | adv2New2

- type: code
  title: "전체 사용자 수"
  content: |-
    adv2Active3 = {'user1', 'user2', 'user3'}
    adv2Premium3 = {'user2', 'user4', 'user5'}
    adv2New3 = {'user5', 'user6'}
    len(adv2Active3 | adv2Premium3 | adv2New3)
```

**종합연습에서 특히 중요**
- 한 섹션에 개념은 하나지만 여러 출력이 필요한 경우
- 각 출력마다 별도 code 블록으로 분리
- 학습자가 단계별로 실행하며 결과 확인 가능
- print 여러 줄보다 학습 효과 극대화

### YAML 작성 규칙 (중요!)
- **모든 텍스트 필드를 따옴표로 감싸기**
  - title: "제목"
  - subtitle: "부제목"
  - content: "내용"
  - description: "설명"
- **이유**: YAML 파서가 특수문자(-, :, *, % 등)를 잘못 해석하는 것 방지
- **특히 주의**:
  - `-`로 시작하는 텍스트 (리스트로 오인)
  - `:`이 포함된 텍스트 (키:값으로 오인)
  - 특수 연산자 기호 (*, %, / 등)
- code content는 `|-` 사용하여 블록으로 작성

## Import 전략

### Day 1~17: Import 없음
```python
len('Hello')
type(10)
```

### Day 18 (모듈 학습일): 각 섹션에서 서로 다른 모듈
```python
# 섹션1
import math
math.sqrt(16)

# 섹션2
import random
random.randint(1, 10)

# 섹션3
import os
os.getcwd()
```

### Day 19~30: 최상단 imports + 필요시 추가
```yaml
- id: imports
  blocks:
  - type: code
    content: |-
      import json
      import csv

- id: section1
  blocks:
  - type: code
    content: |-
      from datetime import datetime
      dataDict = {'now': datetime.now()}
      dataDict
```

## Expansion 작성 규칙

### 난이도별 구성
```yaml
- id: practice
  title: Day N 종합 복습
  blocks:
  - type: text
    content: 난이도별로 복습합니다. 🟢 기본부터 🔴 심화까지 도전하세요.

  - type: expansion
    title: "🟢 기본1: 제목"
    code: |-
      basicMission1Var = 'value'
      basicMission1Var

  - type: expansion
    title: "🟡 응용1: 제목"
    code: |-
      applyMission1Var = 'value'
      applyMission1Var

  - type: expansion
    title: "🔴 심화1: 제목"
    code: |-
      advMission1Var = 'value'
      advMission1Var
```

### 미션 개수
- 🟢 기본: 5개
- 🟡 응용: 5개
- 🔴 심화: 3~5개
- 총 13~15개 미션

## 작업 순서

### Phase 1: 백업 및 정리 ✅
- [x] 기존 30days → 30days_backup_20241228
- [x] 새 30days 폴더 생성

### Phase 2: 기획
- [ ] curriculum.json 작성
- [ ] Day 1~30 상세 커리큘럼 확정

### Phase 3: 템플릿
- [ ] day 템플릿 YAML 작성
- [ ] 검증 스크립트 작성

### Phase 4: 실행
- [ ] Day 1부터 순서대로 작성
- [ ] 각 day 작성 후 검증
- [ ] Day 30까지 완성

## 검증 체크리스트

### 각 파일 작성 후 확인
- [ ] 변수명 파일 전체에서 중복 없음
- [ ] 금지된 개념 사용하지 않음
- [ ] print() 최소화 (가급적 0개)
- [ ] 1섹션 = 1개념
- [ ] expansion 10개 이상
- [ ] YAML 문법 오류 없음

## 품질 보증 전략 (Multi-Agent Collaboration)

### Agent 역할 분담

#### 1. Content Creator Agent
**책임**: 교육 콘텐츠 작성
- curriculum.json 기반 개념 선정
- 6개 섹션 + practice 구조 생성
- 코드 예제 작성
- 난이도별 미션 설계 (🟢5 + 🟡5 + 🔴10)

**체크리스트**:
- [ ] curriculum의 newConcepts 모두 다룸
- [ ] forbidden 개념 사용 안 함
- [ ] 섹션당 1개념만 집중
- [ ] Day 11+ print() 미사용

#### 2. Variable Naming Agent
**책임**: 변수명 중복 검사 및 수정
- 파일 전체 변수명 추출
- 중복 검출 (함수 파라미터 포함)
- 동의어로 대체 (REDESIGN_PLAN 규칙 준수)
- camelCase 검증

**체크리스트**:
- [ ] 파일 내 변수명 중복 0개
- [ ] 모든 변수 camelCase
- [ ] 의미 있는 짧은 이름 (1단어 우선)
- [ ] 숫자 접미사는 1-3만 사용

**검증 명령어**:
```python
import re
from collections import Counter
var_pattern = r'^\s{6}([a-z][a-zA-Z0-9]*)\s*='
vars = re.findall(var_pattern, content, re.MULTILINE)
duplicates = {k: v for k, v in Counter(vars).items() if v > 1}
```

#### 3. Curriculum Validator Agent
**책임**: curriculum.json 준수 검증
- allowedConcepts만 사용 확인
- forbidden 개념 사용 검출
- 이전 Day 개념만 사용 확인
- newConcepts 누락 검사

**체크리스트**:
- [ ] forbidden 개념 사용 0건
- [ ] 미래 Day 개념 사용 0건
- [ ] newConcepts 100% 포함
- [ ] allowedConcepts 범위 내

**검증 방법**:
```python
# curriculum.json 로드
# 코드에서 사용된 개념 추출
# forbidden과 교집합 확인
# newConcepts 누락 확인
```

#### 4. Output Pattern Validator Agent
**책임**: 출력 패턴 검증
- Day 1-10: print() 사용 확인
- Day 11+: print() 사용 금지 확인
- dict wrapping 금지 확인
- 마지막 표현식 출력 확인

**체크리스트**:
- [ ] Day 11+ print() 사용 0건
- [ ] dict wrapping ({"key": val}) 사용 0건
- [ ] 단일 값 또는 튜플만 출력
- [ ] 각 코드 블록이 의미 있는 출력

**금지 패턴**:
```python
# ❌ Day 11+ 이후
print(result)

# ❌ dict wrapping
{"result": value, "status": status}

# ✅ 올바른 출력
result
# 또는
result, status, count
```

#### 5. YAML & Structure Validator Agent
**책임**: YAML 문법 및 구조 검증
- YAML 문법 오류 검사
- meta, intro, sections, practice 구조 확인
- practice 미션 개수 확인 (5+5+10=20)
- 각 섹션 필수 필드 확인

**체크리스트**:
- [ ] YAML 문법 오류 0건
- [ ] 필수 섹션 모두 존재
- [ ] practice 정확히 20개
- [ ] expansion title 형식 정확

**검증 명령어**:
```python
import yaml
yaml.safe_load(open('dayXX_xxx.yaml', encoding='utf-8'))
```

### 작업 플로우

```
1. Content Creator 작성
   ↓
2. 병렬 검증 (동시 실행)
   ├─ Variable Naming 검사
   ├─ Curriculum Validator 검사
   ├─ Output Pattern 검사
   └─ YAML Validator 검사
   ↓
3. 문제 발견시
   ├─ Variable Naming → 동의어 대체
   ├─ Curriculum → 개념 수정/제거
   ├─ Output Pattern → 출력 방식 수정
   └─ YAML → 문법 수정
   ↓
4. 재검증 (모든 Agent 재실행)
   ↓
5. 모든 체크 ✅ → 완료
```

### 자동화 스크립트 예시

```python
# validate_day.py
def validate_day(day_num):
    """Day 파일 완전 검증"""

    # 1. YAML 문법
    yaml_ok = validate_yaml(f'day{day_num:02d}_*.yaml')

    # 2. 변수 중복
    var_ok = check_variable_duplicates(content)

    # 3. Curriculum 준수
    curr_ok = validate_curriculum(day_num, content)

    # 4. 출력 패턴
    output_ok = validate_output_pattern(day_num, content)

    # 5. 구조 완전성
    struct_ok = validate_structure(content)

    return all([yaml_ok, var_ok, curr_ok, output_ok, struct_ok])
```

### Agent 협업 모드

**방법 1: Sequential (순차)**
- Content Creator → Variable Naming → Curriculum → Output → YAML
- 안전하지만 느림

**방법 2: Parallel (병렬) - 권장**
- Content Creator 완료 후
- 4개 Validator Agent 동시 실행
- 빠르고 효율적

**방법 3: Iterative (반복)**
- 전체 Agent 순회
- 문제 수정
- 재검증
- 모든 Agent ✅ 될 때까지 반복

## 성공 기준

1. **완전 독립**: 모든 섹션이 어떤 순서로 실행되어도 작동
2. **개념 순서**: curriculum.json 기준 100% 준수
3. **학습 효과**: 학생이 30일 만에 파이썬 문법 완전 마스터
4. **Marimo 최적화**: Marimo 장점 100% 활용
5. **중복 제거**: 다른 카테고리와 중복 0%
6. **품질 보증**: 모든 Agent 검증 통과
