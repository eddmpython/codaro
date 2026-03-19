# Pyodide 환경 호환성 가이드

## Pyodide란?

Pyodide는 WebAssembly를 사용하여 브라우저에서 Python을 실행하는 환경입니다.
웹 기반 Marimo는 Pyodide를 사용하므로 일부 기능에 제한이 있습니다.

## OS 모듈 호환성

### ✅ 작동하는 기능

#### 경로 조작 (Path Manipulation)
```python
import os

# 모두 정상 작동
os.path.join('a', 'b', 'c')          # 'a/b/c'
os.path.dirname('/path/to/file')     # '/path/to'
os.path.basename('/path/to/file')    # 'file'
os.path.split('/path/to/file')       # ('/path/to', 'file')
os.path.splitext('file.txt')         # ('file', '.txt')
```

#### 경로 확인 (Path Checking)
```python
# 가상 파일시스템에서 작동
os.path.exists('/')                  # True
os.path.isdir('/')                   # True
os.path.isfile('/some/file')         # 파일 존재시 True
```

#### 환경 및 정보
```python
os.getcwd()                          # 현재 디렉토리
os.listdir('/')                      # 디렉토리 내용
os.environ                           # 환경 변수 (읽기만)
os.name                              # 'posix' (항상)
```

### ❌ 작동 안하는 기능

#### 시스템 명령
```python
# 불가능
os.system('ls')                      # 에러
os.popen('command')                  # 에러
```

#### 프로세스 관리
```python
# 불가능
os.fork()                            # 에러
os.exec*()                           # 에러
os.kill()                            # 에러
os.wait()                            # 에러
```

#### 고급 파일 작업
```python
# 제한적 또는 불가능
os.symlink()                         # 불가능
os.link()                            # 불가능
os.chmod()                           # 제한적
os.chown()                           # 불가능
```

### ⚠️ 제한적으로 작동하는 기능

#### 파일/디렉토리 작업
```python
# 가상 파일시스템에서만 작동
os.mkdir('/tmp/test')                # 메모리 내 생성
os.rmdir('/tmp/test')                # 메모리 내 삭제
os.remove('/tmp/file.txt')           # 메모리 내 삭제
os.rename('/tmp/old', '/tmp/new')    # 메모리 내 이름 변경

# 주의: 브라우저를 새로고침하면 모두 사라짐!
```

## 내장 모듈별 Pyodide 호환성

### Phase 1: 기초 모듈

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| math | ✅ 완전 | 없음 |
| random | ✅ 완전 | 없음 |
| datetime | ✅ 완전 | 시스템 시간 접근 제한적 |
| time | ✅ 대부분 | sleep() 작동, time() 작동 |
| collections | ✅ 완전 | 없음 |
| itertools | ✅ 완전 | 없음 |
| functools | ✅ 완전 | 없음 |

### Phase 2: 파일/시스템

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| os | ⚠️ 제한적 | 가상 FS만, 시스템 명령 불가 |
| pathlib | ⚠️ 제한적 | 가상 FS만 |
| sys | ✅ 대부분 | argv, stdin/stdout 제한적 |
| glob | ⚠️ 제한적 | 가상 FS만 |
| shutil | ⚠️ 제한적 | 가상 FS만 |

### Phase 3: 데이터 처리

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| json | ✅ 완전 | 없음 |
| csv | ✅ 완전 | 없음 |
| pickle | ✅ 완전 | 없음 |
| struct | ✅ 완전 | 없음 |

### Phase 4: 텍스트

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| string | ✅ 완전 | 없음 |
| textwrap | ✅ 완전 | 없음 |
| difflib | ✅ 완전 | 없음 |
| base64 | ✅ 완전 | 없음 |

### Phase 5: 네트워크

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| urllib | ⚠️ 제한적 | CORS 제한, fetch API 사용 권장 |
| http | ⚠️ 제한적 | 서버 기능 불가 |
| socket | ❌ 불가 | WebSocket API 사용 권장 |
| email | ✅ 대부분 | 파싱은 가능, 전송 불가 |

### Phase 6: 멀티태스킹

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| threading | ❌ 불가 | Web Workers 사용 권장 |
| multiprocessing | ❌ 불가 | 브라우저에서 불가능 |
| asyncio | ✅ 대부분 | 이벤트 루프 작동 |
| subprocess | ❌ 불가 | 시스템 명령 실행 불가 |

### Phase 7: 고급 도구

| 모듈 | 호환성 | 제한사항 |
|------|--------|----------|
| argparse | ⚠️ 제한적 | sys.argv 제한적 |
| logging | ✅ 완전 | 파일 로깅은 가상 FS |
| unittest | ✅ 완전 | 없음 |
| timeit | ✅ 완전 | 없음 |
| copy | ✅ 완전 | 없음 |
| pprint | ✅ 완전 | 없음 |
| inspect | ✅ 완전 | 없음 |

## 권장 사항

### ✅ Pyodide 친화적 모듈 (우선 작성)
1. **math** - 완전 호환
2. **random** - 완전 호환
3. **datetime** - 완전 호환
4. **collections** - 완전 호환
5. **itertools** - 완전 호환
6. **functools** - 완전 호환
7. **json** - 완전 호환
8. **csv** - 완전 호환
9. **string** - 완전 호환
10. **copy** - 완전 호환

### ⚠️ 제한사항 명시 필요 (주의해서 작성)
11. **os** - 가상 FS 설명 필요
12. **pathlib** - 가상 FS 설명 필요
13. **sys** - 제한사항 명시
14. **urllib** - CORS 제한 설명
15. **asyncio** - 일부 기능 제한

### ❌ Pyodide 비호환 (후순위 또는 제외)
- **threading** - 대안 제시
- **multiprocessing** - 대안 제시
- **socket** - WebSocket 대안 제시
- **subprocess** - 사용 불가 명시

## 파일 작성 가이드

### 예시: os 모듈 작성시

```yaml
sections:
- id: "path_operations"
  title: "경로 조작"
  subtitle: "✅ Pyodide 완전 지원"
  blocks:
  - type: "code"
    content: |-
      import os

      # 모두 정상 작동
      joined = os.path.join('folder', 'file.txt')
      base = os.path.basename('/path/to/file')
      joined, base

- id: "file_operations"
  title: "파일 작업"
  subtitle: "⚠️ 가상 파일시스템만 지원"
  blocks:
  - type: "note"
    content: "Pyodide는 메모리 내 가상 파일시스템을 사용합니다. 실제 로컬 파일은 접근할 수 없습니다."
  - type: "code"
    content: |-
      import os

      # 가상 FS에서만 작동
      # 브라우저 새로고침시 사라짐
      os.mkdir('/tmp/test')
      exists = os.path.exists('/tmp/test')
      exists

- id: "system_commands"
  title: "시스템 명령"
  subtitle: "❌ Pyodide 미지원"
  blocks:
  - type: "note"
    content: "브라우저 환경에서는 시스템 명령을 실행할 수 없습니다. os.system()과 subprocess는 작동하지 않습니다."
  - type: "code"
    content: |-
      import os

      # ❌ 작동하지 않음
      # os.system('ls')  # 에러 발생

      # ✅ 대신 Python 함수 사용
      files = os.listdir('.')
      files[:3]
```

## 결론

### 작성 가능한 모듈: 약 25개 / 35개 (71%)

**완전 호환 (18개):**
math, random, datetime, time, collections, itertools, functools,
json, csv, pickle, struct, string, textwrap, difflib, base64,
logging, unittest, timeit, copy, pprint, inspect

**제한적 호환 (7개):**
os, pathlib, sys, glob, shutil, urllib, asyncio

**비호환 (10개):**
http, socket, email(전송), threading, multiprocessing, subprocess, argparse(제한적)

### 권장 작업 순서

1. **Phase 1 완성** (7개 모듈) - 모두 완전 호환 ✅
2. **Phase 3-4 완성** (8개 모듈) - 모두 완전 호환 ✅
3. **Phase 7 일부** (6개 모듈) - 모두 완전 호환 ✅
4. **Phase 2 신중** (5개 모듈) - 제한사항 명시 ⚠️
5. **Phase 5-6 선택적** - 대안 제시 또는 제외 고려 ❌

총 **21개 완전 호환 모듈**을 먼저 작성하는 것을 권장합니다!
