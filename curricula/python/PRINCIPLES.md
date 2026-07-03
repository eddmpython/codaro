# studyPython Content 작성 원칙

---

## ⚠️ 필수 참조 문서

**반드시 아래 문서들을 숙지하고 완벽하게 준수해야 합니다:**

1. **VARGUIDE.md** - 변수명 규칙 + 미션카드 가이드
   - yaml 1개 = Codaro 노트북 1개 (파일 전체 변수 중복 금지)
   - 변수명 우선순위: 1단어 > 유사어 > 짧은2단어 > 숫자접미사(2개까지)
   - 미션카드 분리 규칙 및 미션 앞 팁 필수

2. **DATASETS.md** - 데이터셋 사용 가이드
   - 카테고리별 권장 데이터셋
   - 도메인 다양성 확보
   - 기존 데이터 중복 회피

**이 규칙들은 절대적이며 예외 없이 적용됩니다.**

---

## 1. 핵심 원칙: 파일 하나 = 풀 프로젝트 하나

```
파일 하나 = 완성된 프로젝트 하나 = 실제 결과물
```

### 프로젝트 기반 학습
- 각 파일은 **독립적인 풀 프로젝트**
- 프로젝트 완료 시 **완성된 결과물** 산출
- 단순 개념 학습이 아닌 **실제 프로젝트 수행**

### 난이도별 반복 확장
- 프로젝트는 **난이도 순서**로 배치
- 이전 프로젝트에서 배운 개념을 **다음 프로젝트에서 반복 사용**
- 새로운 개념을 **추가하면서 확장**
- 10개 프로젝트 완료 시 **모든 개념 마스터**
- 처음 나오는 개념은 확실한 tip 제공
- 전체 프로젝트는 카테고리의 모든개념을 커버

### 예시 구조
```
Project 01 (초급): 개념 A, B 사용
Project 02 (초급): 개념 A, B + 새로운 C, D 추가
Project 03 (중급): 개념 A, B, C, D + 새로운 E, F 추가
...
Project 10 (고급): 모든 개념 A~Z 종합 활용
```

### 각 프로젝트 파일 구조
1. **목표**: 이 프로젝트에서 만들 결과물
2. **데이터 로드**: 필요한 데이터 준비
3. **탐색적 단계**: 목표 달성을 위한 과정 (여러 코드 블록 가능)
4. **결과물 완성**: 최종 시각화/분석 결과
5. **실습**: 배운 내용으로 추가 프로젝트(배운개념이 최대한 다 들어가도록 답코드는 여러줄가능)

### 섹션 설명 원칙 (매우 중요!)

각 섹션의 text 블록은 **최대한 자세하게 작성**해야 합니다. 학습자가 코드를 실행하기 전에 "왜 이 작업을 하는지", "무엇을 기대할 수 있는지" 충분히 이해할 수 있어야 합니다.

#### text 블록 작성 가이드

**1. intro 섹션의 description**
- 프로젝트 전체의 목표와 의미를 설명
- 실무에서 어떻게 활용되는지 구체적 사례 제시
- 이 프로젝트를 완료하면 무엇을 할 수 있는지 명시
- 최소 2-3문장, 가능하면 더 풍부하게

**2. 라이브러리/데이터 로드 섹션**
- 왜 이 라이브러리/데이터가 필요한지 설명
- 데이터의 특성, 출처, 구조 간략 소개
- 어떤 분석에 적합한 데이터인지 언급

**3. 탐색/분석 단계 섹션**
- 이 단계에서 무엇을 확인하려는지 명확히 설명
- 왜 이 방법을 선택했는지 배경 제시
- 결과를 어떻게 해석해야 하는지 힌트 제공
- 실무에서 이 과정이 왜 중요한지 언급

**4. 시각화/결과물 섹션**
- 어떤 차트를 만들 것인지 미리 설명
- 이 시각화가 보여주는 인사이트 설명
- 차트 해석 방법 안내

**5. 실습 섹션**
- 배운 내용을 어떻게 활용할지 안내
- 미션의 목표와 기대 결과물 설명

#### 좋은 text 블록 예시

```yaml
# ❌ 나쁜 예 - 너무 간단함
- type: text
  content: 데이터를 로드합니다.

# ✅ 좋은 예 - 충분히 상세함
- type: text
  content: |-
    seaborn의 tips 데이터셋은 레스토랑에서 수집된 팁 정보입니다.
    총 244건의 식사 기록이 있으며, 총 결제 금액, 팁 금액, 성별,
    흡연 여부, 요일, 시간대, 인원수 등의 정보를 담고 있습니다.
    이 데이터로 "어떤 조건에서 팁을 많이 주는지" 분석해볼 것입니다.
```

```yaml
# ❌ 나쁜 예 - 무엇을 하는지만 설명
- type: text
  content: 히스토그램을 그립니다.

# ✅ 좋은 예 - 왜, 무엇을, 어떻게 해석할지 설명
- type: text
  content: |-
    팁 금액의 분포를 히스토그램으로 확인합니다. 히스토그램은
    연속형 데이터의 분포 형태를 파악하는 가장 기본적인 방법입니다.
    대부분의 팁이 어느 구간에 몰려있는지, 극단적으로 큰 팁이
    있는지 등을 한눈에 볼 수 있습니다. 정규분포인지, 한쪽으로
    치우쳤는지 확인해보세요.
```

#### text 블록 체크리스트
- [ ] 최소 2문장 이상인가?
- [ ] "왜" 이 작업을 하는지 설명했는가?
- [ ] "무엇을" 기대할 수 있는지 설명했는가?
- [ ] 초보자도 이해할 수 있는 언어인가?
- [ ] 실무/실제 활용 맥락이 있는가?

---

## 2. 실행 환경
- Codaro 로컬 Python 기반 노트북
- 모든 섹션 연결 (변수 공유)
- GitHub raw URL로 데이터 로드

```python
baseUrl = "https://raw.githubusercontent.com"
df = pd.read_csv(f"{baseUrl}/owner/repo/branch/file.csv")
```

### 변수 네이밍과 셀 흐름

Codaro는 로컬 Python 노트북이다. 셀은 위에서 아래로 평범하게 실행되고, 같은 변수를 다음 셀에서 다시 정의해도 동작한다(reactive 셀 제약은 적용하지 않는다).

다만 학습 가독성을 위해 다음 가이드를 따른다.

- 의미가 다른 값이면 변수명을 바꾼다. `df`를 매출 데이터로 쓰다가 다른 셀에서 갑자기 학생 성적으로 재할당하지 않는다.
- 의미가 같으면 자연스럽게 변수를 다시 정의해도 된다. 예를 들어 같은 가격표 데이터를 다음 섹션에서 다시 만들어 시작점을 명확히 하는 편이 학습 흐름에 도움이 되면 그렇게 한다.
- 동일 yaml 안에서 한 변수가 여러 의미로 쓰이는 것만 피하면 된다.

```python
# ✅ 의미가 같은 값을 다음 셀에서 다시 정의해 시작점을 명확히 함
# 셀1: df = pd.read_csv(...)
# 셀2: df = pd.read_csv(...); df["amount"] = df["qty"] * df["price"]

# ✅ 의미가 다르면 변수명을 다르게
# 셀1: salesDf = pd.read_csv("sales.csv")
# 셀2: gradesDf = pd.read_csv("grades.csv")
```

**변수 네이밍 규칙:**
- 차트: `figBar`, `figLine`, `figScatter`, `figFinal`
- 데이터프레임: `df`, `dfFiltered`, `dfGrouped`, `dfResult`

## 3. 코드 스타일
- print() 금지 - 표현식만
- 주석 금지 - text 블록으로 설명
- 변수명 카멜케이스
- 메서드 체이닝 권장

### ⚠️ 코드 블록 분리 원칙 (핵심!)

**하나의 `type: code`에 너무 많은 코드는 학습을 방해합니다.**

Codaro는 각 셀의 마지막 라인을 자동 출력합니다. 이를 활용하여 학습자가 **중간 결과를 탐색**할 수 있도록 코드를 분리하세요.

```yaml
# ❌ 나쁜 예 - 한 블록에 모든 코드
- type: code
  content: |-
    import pandas as pd
    df = pd.read_csv(url)
    df = df.dropna()
    df['new'] = df['a'] + df['b']
    grouped = df.groupby('category').mean()
    result = grouped.sort_values('value', ascending=False)
    result.head(10)

# ✅ 좋은 예 - 단계별 분리 + 중간 확인
- type: code
  title: 데이터 로드
  content: |-
    import pandas as pd
    df = pd.read_csv(url)
    df.shape

- type: code
  title: 전처리
  content: |-
    cleaned = df.dropna()
    cleaned['new'] = cleaned['a'] + cleaned['b']
    cleaned.head()

- type: code
  title: 집계
  content: |-
    grouped = cleaned.groupby('category').mean()
    grouped

- type: code
  title: 정렬 및 결과
  content: |-
    result = grouped.sort_values('value', ascending=False)
    result.head(10)
```

**분리 원칙:**
1. **마지막 라인 = 확인용 변수**: 각 코드 블록의 마지막 라인에 변수명만 적어 결과 확인
2. **의미있는 논리적 단위**: 줄 수보다 논리적 완결성이 우선. 하나의 차트/테이블 생성이 10줄 이상이어도 분리하지 않음
3. **단계별 분리**: 로드 / 전처리 / 분석 / 시각화 등 논리적 단위로 분리
4. **탐색 가능**: 학습자가 각 단계의 중간 결과를 확인할 수 있도록
5. **메서드 체이닝 우선**: `var = var.method()` 형태가 어색하면 메서드 체이닝으로 한 블록에 유지한다.

**마지막 라인 출력 예시:**
```python
df.shape          # 데이터 크기 확인
df.head()         # 처음 5행 확인
df.describe()     # 통계 요약 확인
cleaned           # 전처리된 데이터 확인
result            # 최종 결과 확인
```

## 4. 대상 독자
- 완전 초보자
- 개념 상세 설명
- 쉬운 용어 사용

## 5. 00_소개 파일
- 카테고리 소개
- 코드 블록 절대 금지
- UI 컴포넌트만 사용
- difficulty 없음 (난이도 책정 안함)
- **최대한 자세하게 작성** - 장점, 활용 사례, 비교 등 풍부하게
- 섹션을 다양하게 나누어 **많은 정보 제공**
- 학습자가 "왜 이걸 배워야 하는지" 충분히 이해할 수 있도록

## 6. 배지(badge) 체계
| badge | 프로젝트 | 설명 |
|-------|---------|------|
| 입문 | 01, 02 | 기본 문법, 첫 시각화 |
| 기초 | 03, 04, 05 | 핵심 개념 활용 |
| 중급 | 06, 07, 08 | 복합 분석, 고급 기능 |
| 심화 | 09, 10 | 종합 프로젝트, 실전 |

- 00_소개 파일: badge 없음 또는 "소개"

## 7. YAML 특수문자 주의

**필수: 모든 문자열 값에 쌍따옴표 사용 권장**

특수문자가 포함될 수 있는 모든 값은 반드시 쌍따옴표로 감싸기:
- `&` - YAML anchor로 해석됨
- `|` - literal block scalar로 해석됨
- `*` - YAML alias로 해석됨
- `~` - null로 해석됨
- `!` - 태그로 해석됨
- `:` - key-value 구분자로 해석됨
- `#` - 주석으로 해석됨
- `@` - reserved character
- `` ` `` - reserved character

```yaml
# ❌ 잘못된 예 - 파싱 에러 발생
subtitle: & (and), | (or)
content: 조건 결합 ~not 연산

# ✅ 올바른 예 - 쌍따옴표로 감싸기
subtitle: "& (and), | (or)"
content: "조건 결합 ~not 연산"
```

**ScannerError 예방:**
- subtitle, title, content 등 모든 문자열 필드에서 특수문자 사용 시 쌍따옴표 필수
- 확실하지 않으면 무조건 쌍따옴표로 감싸기

### text 블록 상세 작성 시 주의사항

**type: text의 content 필드는 반드시 쌍따옴표로 감싸기**

text 블록에 상세한 설명을 작성할 때 코드 예시나 기호가 포함되면 YAML 스캐너가 에러를 발생시킵니다.

```yaml
# ❌ 에러 발생 - 콜론(:)이 key-value로 해석됨
- type: text
  content: |-
    딕셔너리 스프레드: {**getSettings(), "키": 새값}

# yaml.scanner.ScannerError: mapping values are not allowed here
# line 231, column 100

# ✅ 올바른 예 - 쌍따옴표로 감싸기
- type: text
  content: "딕셔너리 스프레드: {**getSettings(), \"키\": 새값}"
```

**주의 기호:**
- `:` (콜론) - 딕셔너리, JSON 예시에서 자주 등장
- `{`, `}` (중괄호) - 딕셔너리, f-string 예시
- `[`, `]` (대괄호) - 리스트 예시
- `"`, `'` (따옴표) - 문자열 예시 (이스케이프 필요: `\"`)

**권장사항:**
- text 블록에 코드 예시나 기호가 포함되면 **처음부터 쌍따옴표 사용**
- 내부 쌍따옴표는 `\"` 로 이스케이프
- `|-` 블록 스칼라보다 쌍따옴표가 안전함

## 8. 실습 섹션
- 프로젝트 내 배운 모든 개념 종합(전처리과정 포함)
- expansion 블록으로 정답 제공

### Expansion 블록 형식

**blocks 분리 방식 사용 (권장)**

긴 코드는 `code: |-` 대신 `blocks:` 형식으로 분리하여 학습 효과를 높입니다.

```yaml
# ❌ 기존 방식 (단일 블록)
- type: expansion
  title: "미션1: 데이터 분석"
  code: |-
    import matplotlib.pyplot as plt
    # ... 긴 코드

# ✅ 새로운 방식 (blocks 분리)
- type: expansion
  title: "미션1: 데이터 분석"
  blocks:
  - type: code
    title: "데이터 로드"
    content: |-
      import matplotlib.pyplot as plt
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset

      data = loadLocalDataset('penguins').dropna()
  - type: code
    title: "차트 생성"
    content: |-
      chart, plot = plt.subplots(figsize=(10, 8))
      # ... 차트 코드
      chart
```

**분리 원칙:**
- 2개로 제한하지 않음 - code 3개, 4개도 가능
- 하나의 code에 너무 많으면 학습 방해. **탐색적으로 중간 확인 가능하게 분리가 핵심**
- 분리 기준: 데이터 로드 / 전처리 / 시각화 요소별 / 패널별
- title은 해당 코드의 역할을 간결하게 표현

### 실습 미션 작성 원칙 (매우 중요!)

**핵심**: 각 미션은 **완전히 독립적**으로 실행 가능해야 함

#### 독립성 원칙
```yaml
# ✅ 올바른 예 - 각 미션이 독립적
- type: expansion
  title: "미션1: Radio 광고비 전체 분석"
  code: |-
    import pandas as pd
    import statsmodels.api as sm

    url1 = "https://..."
    data1 = pd.read_csv(url1)
    X1 = sm.add_constant(data1[['Radio']])
    y1 = data1['Sales']
    model1 = sm.OLS(y1, X1).fit()
    model1.summary()

- type: expansion
  title: "미션2: 세 매체 비교"
  code: |-
    import pandas as pd
    import statsmodels.api as sm

    url2 = "https://..."
    data2 = pd.read_csv(url2)
    # ... 전체 과정 포함

# ❌ 잘못된 예 - 이전 미션의 변수 의존
- type: expansion
  title: "미션2: Radio 비교"
  code: |-
    # model은 어디서? adData는 어디서? (에러!)
    modelRadio.rsquared > model.rsquared
```

#### 미션별 작성 규칙

1. **import문 포함**
   - 각 미션 시작에 필요한 모든 import 포함
   - 사용자가 연습 예제 실행했을 수도 있으므로 tip으로 안내

```yaml
- type: tip
  content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
```

2. **데이터 로딩 포함**
   - 각 미션마다 독립적으로 데이터 로딩
   - URL 변수명을 미션별로 다르게 (`url1`, `url2`, `urlRadio`, `urlCompare`)

3. **변수명 고유화**
   - 연습 예제와 겹치지 않도록
   - 미션 간 겹치지 않도록
   - 예: `data1`, `data2`, `dataRadio`, `dataCompare`
   - 모델: `model1`, `model2`, `modelRadio`, `modelCompare`

4. **전체 과정 포함**
   - 데이터 로딩 → 전처리 → 모델 학습 → 평가 → 시각화
   - 해당 프로젝트에서 배운 개념 최대한 활용

#### 미션 개수 및 구성
- **2개 미션**으로 구성 (3개 이상 금지)
- 미션1: 해당 프로젝트 핵심 개념 전체 과정
- 미션2: 누적 개념 종합 + 비교/분석

#### 예시 구조 (blocks 분리 방식)
```yaml
- id: practice
  title: 실습
  subtitle: 펭귄 데이터 분석 프로젝트
  blocks:
  - type: text
    content: 지금까지 배운 내용을 활용해서 펭귄 데이터를 분석해봅시다.
  - type: tip
    content: 각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  - type: expansion
    title: "미션1: 섬별 체중 분포 비교"
    blocks:
    - type: code
      title: "데이터 로드"
      content: |-
        import matplotlib.pyplot as plt
        import seaborn as sns
        from codaro.curriculum.localData import loadLocalDataset

        data = loadLocalDataset('penguins').dropna()
    - type: code
      title: "바이올린 플롯"
      content: |-
        chart, plot = plt.subplots(figsize=(10, 6))
        # ... 바이올린 플롯 코드
        chart
  - type: expansion
    title: "미션2: 종별 신체 특성 비교"
    blocks:
    - type: code
      title: "데이터 로드"
      content: |-
        import matplotlib.pyplot as plt
        import seaborn as sns
        from codaro.curriculum.localData import loadLocalDataset

        df = loadLocalDataset('penguins').dropna()
    - type: code
      title: "산점도"
      content: |-
        canvas, panel = plt.subplots(figsize=(10, 6))
        # ... 산점도 코드
        canvas
    - type: code
      title: "박스플롯"
      content: |-
        # panel 재사용 또는 새 변수
        # ... 박스플롯 코드
        canvas
```


## 8.5 검증(check) 작성 가이드

학습카드의 `check` 필드는 학생이 "검증하기" 버튼을 눌렀을 때 백엔드 평가기(`runExerciseCheck`)가 실제로 코드를 실행해 pass/fail을 돌려주는 채널이다. `check.type`이 비어 있으면 학생은 텍스트 안내만 보고 본인이 직접 판단해야 한다(자율 판정). type을 지정해야 자동 평가가 활성화된다.

### 두 가지 키 갈래

`check`는 dict이며, 키는 두 갈래로 나뉜다:

1. **평가용 reserved key 6개** — 백엔드 평가기가 읽는다. UI 표시 패널에는 안 보임.
   - `type` (필수, 4가지 중 하나: `noError` / `output` / `variable` / `contains`)
   - `expectedCode` — type=output에서 정답 코드. 미지정 시 exercise.solution이 자동 fallback (단 solution != starterCode일 때만).
   - `variableName` — type=variable에서 검사할 변수명.
   - `expectedValue` — type=variable에서 기대 repr 문자열.
   - `requiredPatterns` — type=contains에서 학생 코드가 반드시 포함해야 할 문자열 리스트.
   - `hints` — 실패 시 단계별로 노출할 힌트 리스트 (선택).

2. **표시용 key** — 평가에 영향 없음. "확인" 패널에 그대로 렌더된다. 권장 어휘:
   - `noError`, `resultCheck`, `assertCheck`, `outputCheck` — 각각 "실행 조건", "확인할 것", "assert", "출력"으로 라벨링되어 표시.
   - 임의 키도 가능. 라벨이 없으면 키 이름 그대로 노출됨.

### 섹션 종류별 권장 type

| 섹션 종류 | 권장 type | 이유 |
|-----------|-----------|------|
| 로딩 (step1_load 등) | `noError` | 단순 import + 데이터 로드. 에러만 없으면 성공. |
| 탐색 (head/info/value_counts) | `noError` | 결과 확인용. 출력값 비교는 과한 검증. |
| `workflow_validation` (합성 데이터 + inline assert) | `noError` | snippet 안의 assert가 깨지면 자동 fail로 신호. 가장 안전한 패턴. |
| 빈칸 채우기 exercise (`___` 있는 것) | `output` (+ solution 자동 fallback) | 정답 코드와 같은 출력이면 pass. solution만 적어두면 expectedCode 자동. |
| 변수 정의가 명확한 섹션 | `variable` | 특정 변수가 특정 값이 되어야 할 때. 학생이 이전 셀을 실행하지 않았으면 NameError 위험. |
| 특정 메서드 사용 강제 학습 | `contains` (+ requiredPatterns) | 정답 코드에 특정 토큰이 들어 있는지 grep. 실행 없이 빠름. |

### 작성 예시

**1. noError (가장 흔한 패턴)**
```yaml
check:
  type: noError
  noError: "셀이 에러 없이 실행되어야 합니다."
  resultCheck: "결과가 0보다 큰 정수여야 합니다."
```

**2. output (빈칸 채우기, solution 자동 fallback)**
```yaml
exercise:
  prompt: "___ 자리에 평균을 구하는 메서드를 채우세요."
  starterCode: |-
    result = df['age'].___()
  solution: |-
    result = df['age'].mean()
  check:
    type: output
    noError: "mean 호출이 정상 실행되어야 합니다."
    resultCheck: "result가 평균값과 같아야 합니다."
```
expectedCode가 비어 있어도 solution이 자동으로 expected가 된다. starterCode와 solution이 다르므로 솔루션을 채워야만 통과.

**3. variable (변수 값 검증)**
```yaml
check:
  type: variable
  variableName: answer
  expectedValue: "42"
  resultCheck: "answer 변수가 42여야 합니다."
```

**4. contains (코드 패턴 검증, 실행 없음)**
```yaml
check:
  type: contains
  requiredPatterns:
  - groupby
  - agg
  resultCheck: "groupby와 agg를 모두 사용해야 합니다."
```

### 안티패턴

1. **큰 DataFrame을 type=output 비교에 쓰지 마라.** output 비교는 학생 코드와 expectedCode를 같은 세션에서 두 번 실행한다. 1만 행 이상의 DataFrame이면 세션 메모리가 두 배 + 변수 오염. workflow_validation의 합성 mini DataFrame 패턴을 써라.

2. **prerequisite 변수 의존하는 variable 검증 피해라.** 학생이 셀 1~4를 안 돌리면 5번 셀의 `penguins` 변수가 없다. variable type은 변수 정의가 명백한 self-contained 섹션에서만 써라.

3. **starterCode == solution인데 type=output 쓰지 마라.** 컨버터는 둘이 같으면 expectedCode 자동 fallback을 막는다(그렇지 않으면 학생 코드 == 정답 코드가 되어 영원히 pass). 실수 방지 가드지만, 의미 있는 평가가 안 된다는 점을 알고 있어야 함.

4. **표시용 키에 평가용 키 이름을 쓰지 마라.** `noError`, `resultCheck` 등은 표시용이지만, `type`이나 `expectedCode`는 평가용 reserved. 임의 표시 라벨에 reserved key 이름을 쓰면 평가기가 잘못 해석한다.

### 작성자 사전 검증 도구

작성한 check가 실제로 통과/실패하는지 UI 클릭 없이 확인:

```powershell
uv run python -X utf8 docs/skills/ops/tools/validateLessonChecks.py <yaml-path-or-dir>
```

이 도구는 각 type 정의 섹션마다:
1. solution을 학생 코드로 던져 → pass 여야 함
2. starterCode가 solution과 다르면 그것을 학생 코드로 던져 → fail 이어야 함 (빈칸이 살아 있다는 보조 가드)

두 시나리오 모두 만족하면 그 check는 작동함이 보장된다.


## 9. tip/note 사용 규칙

### tip 사용 (코드 설명)
- **위치**: 새로운 개념이 처음 등장하는 코드 블록 직후
- **목적**: 해당 문법/함수의 의미와 사용법 설명
- **형식**: title 선택, content 필수, 최대한 자세하게!

```yaml
- type: code
  content: |-
    px.histogram(tips, x="tip", nbins=20)

- type: tip
  content: nbins로 막대 개수를 조정합니다. 구간이 많을수록 세밀하게 볼 수 있습니다.
```

**tip 사용 시점:**
1. 프로젝트 내에서 개념이 **처음** 등장할 때
2. 문법이 **복잡하거나** 헷갈릴 수 있을 때
3. **핵심 파라미터**를 강조할 때

### note 사용 (배경 설명)
- **위치**: 00_소개 파일에서 주로 사용
- **목적**: 개념적 배경, 비교, 참고 정보
- **형식**: title 필수, content 필수

```yaml
- type: note
  title: "OLAP vs OLTP"
  content: DuckDB는 OLAP(분석)에 특화되어 있습니다...
```

### 일관성 규칙
- tip은 **코드 직후**에만 배치
- note는 **개념 설명**에만 사용
- 하나의 코드 블록에 tip은 **최대 1개**
- 같은 개념은 프로젝트 내에서 **한 번만** tip 제공

---

### 변수명과 함수명 규칙

```
⚠️ 초중요: yaml 파일 1개 = Codaro 노트북 1개

정규든 미션이든 같은 노트북. 파일 전체 변수 중복 금지.
type : code는 하나의 Codaro 노트북의 셀과 같다
Codaro는 같은셀내 절대 변수재할당을 허용하지 않는다
```

**변수명 선택 우선순위 (반드시 순서대로!):**
```
1순위: 숫자 없는 1단어
       예: fig, ax, df, tips, iris, chart, canvas

2순위: 의미는 같지만 다른 단어
       fig 썼으면 → chart, canvas, board, sheet
       df 썼으면 → data, frame, table, dataset

3순위: 의미있는 짧은 2단어 camelCase
       예: figBar, figLine, axHist, dfFiltered

4순위: 1단어 + 숫자 (최대 2개까지만!)
       예: fig1, fig2 (fig3 이상은 금지)
```

**❌ 나쁜 예:** fig, fig1, fig2, fig3, fig4, fig5...
**✅ 좋은 예:** fig, chart, canvas, figBar, figLine


**스타일:** camelCase 필수, 3단어 이상 피하기

### 섹션 내 코드 블록 분리 원칙
**학습 효과를 위한 단계별 출력**
- 한 섹션에 여러 개념을 보여줄 때, 각 개념마다 별도 code 블록 생성
- 한 번에 여러 개를 출력하지 말고 하나씩 실행하게 함
- 학습자가 각 단계를 독립적으로 확인하며 이해도 향상

## 데이터셋 사용 가이드

데이터셋 선택 시 **DATASETS.md** 파일을 참조하세요.

### 데이터 로드 방법

**1. Codaro 로컬/라이브러리 내장 데이터 (권장)**
```python
from codaro.curriculum.localData import loadLocalDataset
df = loadLocalDataset('tips')

from sklearn.datasets import load_iris
data = load_iris()

import plotly.express as px
df = px.data.gapminder()
```

**2. GitHub Raw URL**
```python
import pandas as pd
baseUrl = "https://raw.githubusercontent.com"
df = pd.read_csv(f"{baseUrl}/owner/repo/branch/file.csv")
```

### 주요 데이터 소스

| 소스 | 호출 방법 | 예시 |
|------|----------|------|
| Codaro 로컬 | `loadLocalDataset('name')` | tips, iris, penguins, titanic, diamonds, mpg, flights, exercise |
| Scikit-learn | `load_*()`, `fetch_*()` | load_iris(), load_digits(), fetch_california_housing() |
| Plotly Express | `px.data.name()` | gapminder(), tips(), stocks() |
| Statsmodels | `sm.datasets.name.load_pandas()` | sunspots, macrodata, co2 |
| Vega Datasets | `data.name()` | cars(), seattle_weather(), stocks() |

### 데이터셋 선택 기준

1. **Codaro 로컬 Python 호환성**: 로컬 데이터 또는 fallback으로 인터넷 연결 없이 핵심 학습 흐름 재현
2. **크기**: 100~50,000행 권장
3. **도메인 다양성**: 기존 카테고리와 중복 최소화
4. **학습 적합성**: 해당 개념을 가르치기에 적절한 구조

### 카테고리별 권장 데이터

새 카테고리 작성 시 기존에 많이 사용된 데이터(iris, tips, penguins, titanic, gapminder, mpg)는 피하고 다양한 도메인의 데이터를 활용하세요.

| 도메인 | 추천 데이터셋 | 소스 |
|--------|--------------|------|
| 게임 | pokemon | GitHub |
| 음악 | spotify_songs | TidyTuesday |
| 과학 | earthquakes | Plotly |
| 의료 | heart, pima-diabetes | jbrownlee |
| 환경 | airquality, global-temp | Rdatasets |
| 금융 | stocks, tesla-stock-price | Plotly |
| 스포츠 | fifa, nba | GitHub |
| 사회 | world-happiness | GitHub |

---

## 커리큘럼 설계 프로세스

### 1단계: 개념 지도 설계
작성 전에 커버 범위를 먼저 설계한다. 이 설계는 작업 메모로만 쓰고, 카테고리 폴더에 PRD.md 같은 기획 문서를 남기지 않는다:
- 커버해야 할 **모든 개념** 나열
- **10개 프로젝트** 정의
- 각 프로젝트별 **사용 개념** 명시
- 난이도 배치 확인

### 2단계: 개념 분배 확인
```
| 개념 | P01 | P02 | P03 | P04 | P05 | P06 | P07 | P08 | P09 | P10 |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| A    |  ✓  |  ✓  |  ✓  |  ✓  |     |     |  ✓  |     |     |  ✓  |
| B    |  ✓  |  ✓  |     |  ✓  |  ✓  |     |     |  ✓  |     |  ✓  |
| C    |     |  ✓  |  ✓  |  ✓  |     |  ✓  |     |     |  ✓  |  ✓  |
```
- 모든 개념이 **최소 3회 이상** 등장하도록
- 초반 프로젝트 개념이 **후반에도 반복**되도록

### 3단계: 파일 작성
- 개념 지도 기반으로 각 파일 작성
- 이전 프로젝트 개념 **자연스럽게 포함**
- 새로운 개념 **추가 확장**

---



---

## Agent 협업 규칙

- 작성: 메인 agent가 yaml 파일 작성
- 검토: Task agent(Explore)로 변수 중복 검사 요청
- 검사 범위: 파일 전체 (정규 + expansion 통합)

---

## 검토 체크리스트

### 프로젝트 완성도
- [ ] 파일이 완성된 프로젝트인가?
- [ ] 명확한 결과물이 있는가?
- [ ] 이전 개념을 반복 사용하는가?
- [ ] 새로운 개념을 추가하는가?

### 난이도 progression
- [ ] 난이도가 점진적으로 상승하는가?
- [ ] 10개 프로젝트로 모든 개념을 커버하는가?

### 코드 품질
- [ ] print() 없는가?
- [ ] 변수명 카멜케이스인가?
- [ ] 각 섹션이 독립 실행 가능한가? (필요한 import와 데이터 정의 포함)
- [ ] 한 변수가 한 yaml 안에서 의미가 다른 값으로 재정의되지 않는가?

### 내용 품질
- [ ] text 블록이 2-3문장 이상으로 충분히 자세한가?
- [ ] 배경, 이유, 효과가 모두 설명되어 있는가?
- [ ] 새로운 개념에 tip이 코드 직후에 있는가?
- [ ] tip 내용이 충분히 상세한가?
- [ ] 실습 섹션이 배운 모든 개념을 활용하는가?
- [ ] structured 섹션의 check에 `type` 키가 있고 `validateLessonChecks.py`가 통과하는가? (§8.5 참조)

---
