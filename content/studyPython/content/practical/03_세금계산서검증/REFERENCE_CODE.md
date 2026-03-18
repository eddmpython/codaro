# 세금계산서 검증 핵심 코드 라이브러리

> **출처**: Notion 학습 자료 `전처리 및 불부합결과` (13,585자)  
> **용도**: 재사용 가능한 함수 및 패턴 정리

---

## 1. 데이터 읽기 및 병합

### 1.1 로컬 환경: glob 패턴 매칭
```python
import glob
import pandas as pd

def readFiles(pattern, header=None):
    """
    glob 패턴으로 여러 파일을 읽어서 하나로 병합
    
    Args:
        pattern (str): glob 패턴 (예: '*매출전자세금계산서목록*')
        header (int): 헤더 행 번호 (None이면 첫 행)
    
    Returns:
        pd.DataFrame: 병합된 DataFrame
    
    예시:
        hts = readFiles('*매출전자세금계산서목록*', header=5)
        erp = readFiles('*부가세수정_매출*.xlsx', header=3)
    """
    files = glob.glob(pattern)
    data = [pd.read_excel(f, header=header) for f in files]
    return pd.concat(data, ignore_index=True)
```

### 1.2 웹 환경: BytesIO 사용
```python
from io import BytesIO
import pandas as pd

def readExcelFromBytes(content, header=None):
    """
    바이트 데이터로 엑셀 읽기 (웹 업로드용)
    
    Args:
        content (bytes): 파일 바이트 데이터
        header (int): 헤더 행 번호
    
    Returns:
        pd.DataFrame
    """
    return pd.read_excel(BytesIO(content), header=header)
```

---

## 2. 데이터 전처리

### 2.1 전처리 올인원 함수
```python
def readAndProcessFile(df, prefix, columns, keyColumns):
    """
    DataFrame 전처리 (선택, 정규화, 정렬, KEY 생성)
    
    Args:
        df (pd.DataFrame): 원본 DataFrame
        prefix (str): 컬럼명 접두사 ('hts' 또는 'erp')
        columns (list): 선택할 컬럼명 리스트
        keyColumns (list): KEY 역할 컬럼 (순서: [사업자번호, 공급가액, 세액])
    
    Returns:
        pd.DataFrame: 전처리 완료된 DataFrame
    
    예시:
        htsColumns = ['작성일자', '승인번호', '공급받는자사업자등록번호', '상호.1', '공급가액', '세액']
        htsKeyCols = ['공급받는자사업자등록번호', '공급가액', '세액']
        
        htsProcessed = readAndProcessFile(
            df=hts,
            prefix='hts',
            columns=htsColumns,
            keyColumns=htsKeyCols
        )
    """
    # 1. 필요한 컬럼만 선택
    df = df[columns].copy()
    
    # 2. 컬럼명에 접두사 추가 (hts_, erp_)
    df.columns = f'{prefix}_' + df.columns
    
    # 3. 사업자번호 정규화 (하이픈 제거)
    df[f'{prefix}_{keyColumns[0]}'] = (
        df[f'{prefix}_{keyColumns[0]}']
        .astype(str)
        .str.replace('-', '', regex=False)
    )
    
    # 4. 정렬 (사업자번호 → 공급가액 → 세액)
    df = df.sort_values(
        by=[
            f'{prefix}_{keyColumns[0]}',
            f'{prefix}_{keyColumns[1]}',
            f'{prefix}_{keyColumns[2]}'
        ],
        ascending=[True, True, True]
    )
    
    # 5. KEY 컬럼 생성
    df = df.assign(
        KEY_사업자등록번호=df[f'{prefix}_{keyColumns[0]}'],
        KEY_공급가액=df[f'{prefix}_{keyColumns[1]}'],
        KEY_세액=df[f'{prefix}_{keyColumns[2]}']
    )
    
    # 6. 중복 카운팅 (같은 사업자+금액이 여러 건일 경우)
    df['KEY_중복체크'] = df.groupby(
        ['KEY_사업자등록번호', 'KEY_공급가액']
    ).cumcount() + 1
    
    return df
```

### 2.2 단계별 전처리 (디버깅용)

#### Step 1: 컬럼 선택
```python
HTS = hts[['작성일자', '승인번호', '공급받는자사업자등록번호', '상호.1', '공급가액', '세액']].copy()
```

#### Step 2: 컬럼명 접두사 추가
```python
HTS.columns = 'HTS_' + HTS.columns
# 결과: HTS_작성일자, HTS_승인번호, HTS_공급받는자사업자등록번호, ...
```

#### Step 3: 사업자번호 정규화
```python
HTS['HTS_공급받는자사업자등록번호'] = HTS['HTS_공급받는자사업자등록번호'].str.replace('-', '', regex=False)
# '123-45-67890' → '1234567890'
```

**설명**:
- `.str` 접근자: pandas에서 문자열 메서드 사용
- `regex=False`: 정규표현식 사용 안 함 (단순 문자열 치환)

#### Step 4: 정렬
```python
HTS = HTS.sort_values(
    by=['HTS_공급받는자사업자등록번호', 'HTS_공급가액', 'HTS_세액'],
    ascending=[True, True, True]
)
```

**설명**:
- 1차: 사업자번호 오름차순
- 2차: 공급가액 오름차순
- 3차: 세액 오름차순

#### Step 5: KEY 컬럼 생성
```python
HTS = HTS.assign(
    KEY_사업자등록번호=HTS['HTS_공급받는자사업자등록번호'],
    KEY_공급가액=HTS['HTS_공급가액'],
    KEY_세액=HTS['HTS_세액']
)
```

**대안 방법**:
```python
HTS[['KEY_사업자등록번호', 'KEY_공급가액', 'KEY_세액']] = \
    HTS[['HTS_공급받는자사업자등록번호', 'HTS_공급가액', 'HTS_세액']].copy()
```

#### Step 6: 중복 카운팅
```python
HTS['KEY_중복체크'] = HTS.groupby(
    ['KEY_사업자등록번호', 'KEY_공급가액']
).cumcount() + 1
```

**설명**:
- `groupby`: 사업자번호 + 공급가액으로 그룹화
- `cumcount()`: 각 그룹 내에서 0부터 누적 카운트
- `+ 1`: 1부터 시작하도록 조정

**예시**:
| 사업자번호 | 공급가액 | KEY_중복체크 |
|-----------|---------|-------------|
| 1234567890 | 100000 | 1 |
| 1234567890 | 100000 | 2 |
| 1234567890 | 100000 | 3 |
| 1234567890 | 200000 | 1 |

---

## 3. 병합 및 불부합 추출

### 3.1 Outer Join 병합
```python
mergeResult = pd.merge(
    erpProcessed,
    htsProcessed,
    on=['KEY_사업자등록번호', 'KEY_공급가액', 'KEY_세액', 'KEY_중복체크'],
    how='outer'
)
```

**설명**:
- `on`: 매칭 키 (4개 컬럼)
- `how='outer'`: 양쪽에 모두 유지 (inner는 일치만, left/right는 한쪽 기준)

**결과**:
- 양쪽 모두 있음 → 두 컬럼 모두 값 존재
- ERP만 있음 → HTS 컬럼은 NaN
- HTS만 있음 → ERP 컬럼은 NaN

### 3.2 불부합 추출
```python
mismatch = mergeResult.loc[
    (mergeResult['erp_사업자등록번호'].isnull()) |
    (mergeResult['hts_공급받는자사업자등록번호'].isnull())
]
```

**설명**:
- `isnull()`: NaN 값 체크
- `|`: OR 연산자 (한쪽이라도 비어있으면)
- `.loc[]`: 조건에 맞는 행 필터링

---

## 4. 엑셀 내보내기

### 4.1 단일 시트
```python
final = mergeResult.loc[
    (mergeResult['erp_사업자등록번호'].isnull()) |
    (mergeResult['hts_공급받는자사업자등록번호'].isnull())
]
final.to_excel('불부합결과.xlsx', index=False)
```

### 4.2 멀티 시트
```python
from io import BytesIO

outputBuffer = BytesIO()

with pd.ExcelWriter(outputBuffer, engine='openpyxl') as writer:
    htsProcessed.to_excel(writer, sheet_name='홈택스원본', index=False)
    erpProcessed.to_excel(writer, sheet_name='ERP원본', index=False)
    mergeResult.to_excel(writer, sheet_name='매칭결과', index=False)
    mismatch.to_excel(writer, sheet_name='불부합결과', index=False)

outputBuffer.seek(0)
```

**설명**:
- `ExcelWriter`: 여러 시트를 가진 엑셀 생성
- `sheet_name`: 시트 이름 지정
- `index=False`: 행 번호 저장 안 함
- `seek(0)`: 파일 포인터를 처음으로 되돌림 (다운로드용)

### 4.3 웹 다운로드용 base64 인코딩
```python
import base64

excelB64 = base64.b64encode(outputBuffer.getvalue()).decode()

downloadHtml = f'''
<a href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{excelB64}"
   download="세금계산서_검증결과.xlsx">
   📥 엑셀 다운로드
</a>
'''
```

---

## 5. 완성 코드 (통합)

```python
import pandas as pd
from io import BytesIO

def readAndProcessFile(df, prefix, columns, keyColumns):
    df = df[columns].copy()
    df.columns = f'{prefix}_' + df.columns
    df[f'{prefix}_{keyColumns[0]}'] = (
        df[f'{prefix}_{keyColumns[0]}'].astype(str).str.replace('-', '', regex=False)
    )
    df = df.sort_values(
        by=[
            f'{prefix}_{keyColumns[0]}',
            f'{prefix}_{keyColumns[1]}',
            f'{prefix}_{keyColumns[2]}'
        ],
        ascending=[True, True, True]
    )
    df = df.assign(
        KEY_사업자등록번호=df[f'{prefix}_{keyColumns[0]}'],
        KEY_공급가액=df[f'{prefix}_{keyColumns[1]}'],
        KEY_세액=df[f'{prefix}_{keyColumns[2]}']
    )
    df['KEY_중복체크'] = df.groupby(['KEY_사업자등록번호', 'KEY_공급가액']).cumcount() + 1
    return df

# 1) HTS 파일 처리
htsColumns = ['작성일자', '승인번호', '공급받는자사업자등록번호', '상호.1', '공급가액', '세액']
htsKeyCols = ['공급받는자사업자등록번호', '공급가액', '세액']

htsProcessed = readAndProcessFile(
    df=hts,  # 미리 읽은 DataFrame
    prefix='hts',
    columns=htsColumns,
    keyColumns=htsKeyCols
)

# 2) ERP 파일 처리
erpColumns = ['발행일자', '사업자등록번호', '거래처명', '공급가액', '부가세금액', '부가세유형명', '전표번호']
erpKeyCols = ['사업자등록번호', '공급가액', '부가세금액']

erpProcessed = readAndProcessFile(
    df=erp,  # 미리 읽은 DataFrame
    prefix='erp',
    columns=erpColumns,
    keyColumns=erpKeyCols
)

# 3) 데이터 병합
mergeResult = pd.merge(
    erpProcessed,
    htsProcessed,
    on=['KEY_사업자등록번호', 'KEY_공급가액', 'KEY_세액', 'KEY_중복체크'],
    how='outer'
)

# 4) 불부합 추출
mismatch = mergeResult.loc[
    (mergeResult['erp_사업자등록번호'].isnull()) |
    (mergeResult['hts_공급받는자사업자등록번호'].isnull())
]

# 5) 엑셀 저장 (3시트)
outputBuffer = BytesIO()
with pd.ExcelWriter(outputBuffer, engine='openpyxl') as writer:
    htsProcessed.to_excel(writer, sheet_name='홈택스원본', index=False)
    erpProcessed.to_excel(writer, sheet_name='ERP원본', index=False)
    mergeResult.to_excel(writer, sheet_name='매칭결과', index=False)
    mismatch.to_excel(writer, sheet_name='불부합결과', index=False)
outputBuffer.seek(0)
```

---

## 6. 주요 개념 설명

### 6.1 정규표현식 (Regular Expression)
```python
# 예시
df['사업자번호'].str.replace('-', '', regex=False)  # 단순 문자열 치환
df['사업자번호'].str.replace(r'[^\d]', '', regex=True)  # 숫자 외 모두 제거
```

**regex=True일 때**:
- `\d`: 숫자 (0-9)
- `[^\d]`: 숫자가 아닌 문자
- `+`: 1개 이상
- `*`: 0개 이상

### 6.2 pandas의 .str 접근자
DataFrame의 문자열 열에 문자열 메서드를 적용할 때 필수:
```python
df['col'].replace('-', '')  # ❌ 작동 안 함
df['col'].str.replace('-', '')  # ✅ 작동
```

### 6.3 리팩토링 (Refactoring)
> 기존 코드의 기능은 유지하면서 구조와 가독성을 개선하는 작업

**Before (반복 코드)**:
```python
# HTS 처리
HTS = hts[['작성일자', '승인번호', ...]].copy()
HTS.columns = 'HTS_' + HTS.columns
HTS['HTS_공급받는자사업자등록번호'] = HTS['HTS_공급받는자사업자등록번호'].str.replace('-', '', regex=False)
HTS = HTS.sort_values(...)
# ... (10줄 더)

# ERP 처리
ERP = erp[['발행일자', '사업자등록번호', ...]].copy()
ERP.columns = 'ERP_' + ERP.columns
ERP['ERP_사업자등록번호'] = ERP['ERP_사업자등록번호'].str.replace('-', '', regex=False)
ERP = ERP.sort_values(...)
# ... (10줄 더)
```

**After (함수화)**:
```python
def readAndProcessFile(df, prefix, columns, keyColumns):
    # 전처리 로직 (재사용)
    ...

htsProcessed = readAndProcessFile(hts, 'hts', htsColumns, htsKeyCols)
erpProcessed = readAndProcessFile(erp, 'erp', erpColumns, erpKeyCols)
```

---

## 7. 디버깅 팁

### 7.1 DataFrame 구조 확인
```python
print(df.columns)  # 컬럼명 리스트
print(df.shape)    # (행 수, 열 수)
print(df.head())   # 처음 5행
print(df.info())   # 데이터 타입, 결측치
print(df.describe())  # 수치형 컬럼 통계
```

### 7.2 중복 확인
```python
# 중복 확인
df[df.duplicated(subset=['사업자번호', '공급가액'], keep=False)]

# 중복 카운트
df.groupby(['사업자번호', '공급가액']).size()
```

### 7.3 병합 결과 검증
```python
print(f"HTS: {len(hts)}건")
print(f"ERP: {len(erp)}건")
print(f"병합: {len(mergeResult)}건")
print(f"불부합: {len(mismatch)}건")
print(f"매칭 성공: {len(mergeResult) - len(mismatch)}건")
```

---

## 8. 실무 활용 예시

### 예시 1: 재고실사
```python
# 시스템 재고
systemStock = readExcelFromBytes(systemFile, header=0)
# 실물 재고
physicalStock = readExcelFromBytes(physicalFile, header=0)

# 전처리
systemProcessed = readAndProcessFile(
    systemStock, 'system',
    ['품목코드', '품명', '수량', '금액'],
    ['품목코드', '수량', '금액']
)
physicalProcessed = readAndProcessFile(
    physicalStock, 'physical',
    ['품목코드', '품명', '수량', '금액'],
    ['품목코드', '수량', '금액']
)

# 대사
merged = pd.merge(systemProcessed, physicalProcessed, ...)
diff = merged.loc[merged['system_품목코드'].isnull() | merged['physical_품목코드'].isnull()]
```

### 예시 2: 은행계좌 대사
```python
# 통장 내역
bankStatement = ...
# 회계장부
accountingBook = ...

# KEY: 일자 + 금액 + 적요
# 중복체크로 같은 일자, 같은 금액의 거래도 매칭 가능
```

---

**작성일**: 2026-01-10  
**버전**: 1.0  
**업데이트**: Notion 학습 자료 기반 정리 완료
